// 自動翻譯：找出還沒有英文版、或中文原文改過的文章，一篇一篇翻成英文（規則在 docs/translating.md），
// 翻完跑 check-translation 的檢查，通過才蓋 sourceHash；沒通過的不留檔，下次再翻。
//   npm run translate                         → 先同步文章，再翻（本機用你登入的 claude）
//   node scripts/translate.mjs [--limit 3] [--engine claude,gemini] [--dry-run] [文章 id…]
//
// 翻譯引擎依序嘗試，前一個失敗（例如 Claude 額度用完）就換下一個：
//   claude：Claude Code（CLAUDE_CODE_OAUTH_TOKEN、ANTHROPIC_API_KEY，或本機登入），模型 TRANSLATE_MODEL（預設 opus）
//   gemini：直接呼叫 Gemini API（GEMINI_API_KEY，Google AI Studio 的 key），模型 GEMINI_MODEL（預設自動挑最新的 pro，再退到 flash）
// 順序用 --engine 或 TRANSLATE_ENGINES 指定，預設 claude,gemini。
// CI：.github/workflows/translate.yml
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import matter from 'gray-matter';
import { EN_DIR, check, english, stamp, status } from './i18n-lib.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const limit = Number(opt('--limit', 3));
const engines = opt('--engine', process.env.TRANSLATE_ENGINES || 'claude,gemini').split(',').map((s) => s.trim()).filter(Boolean);
const only = args.filter((a, i) => !a.startsWith('--') && !['--limit', '--engine'].includes(args[i - 1]));

const { missing, stale } = status();
// 新文章優先，再來是改過的
let todo = [...missing.map((p) => ({ ...p, mode: 'new' })), ...stale.map((p) => ({ ...p, mode: 'update' }))];
if (only.length) todo = todo.filter((p) => only.includes(p.id));
const later = todo.slice(limit);
todo = todo.slice(0, limit);

if (!todo.length) {
  console.log('translate: nothing to do');
  process.exit(0);
}
console.log(`translate: ${todo.length} to do${later.length ? `, ${later.length} left for the next run` : ''} (engines: ${engines.join(' → ')})`);
for (const p of todo) console.log(`  ${p.mode === 'new' ? 'new   ' : 'update'} ${p.file}${p.en ? ` → ${p.en}` : ''}`);
if (flag('--dry-run')) process.exit(0);

// ── Claude Code：自己讀檔、寫檔、跑檢查 ─────────────────────────────

const claudePrompt = (p) =>
  p.mode === 'new'
    ? `Translate one of ChiChieh Huang's essays from Traditional Chinese into English.

1. Read docs/translating.md and follow it exactly.
2. The Chinese source is ${p.file} (post id "${p.id}", title "${p.title}").
3. Write the translation to ${EN_DIR}/<slug>.md with \`original: ${p.id}\` and \`sourceHash: pending\`.
4. Run \`node scripts/check-translation.mjs ${EN_DIR}/<slug>.md\` and fix every issue until it passes.

Create only that one file. Do not edit anything else.`
    : `The Chinese original ${p.file} (post id "${p.id}") changed after it was translated into ${p.en}.

1. Read docs/translating.md, especially "Updating an existing translation".
2. Update ${p.en} so it matches the current Chinese. Leave unchanged passages exactly as they are.
3. Run \`node scripts/check-translation.mjs ${p.en}\` and fix every issue until it passes.

Edit only ${p.en}. Do not change its file name, \`original\` or \`sourceHash\`.`;

function claude(p) {
  const run = spawnSync(
    'claude',
    ['-p', claudePrompt(p), '--model', process.env.TRANSLATE_MODEL || 'opus', '--max-turns', '40', '--allowedTools', 'Read,Write,Edit,Glob,Grep,Bash(node scripts/check-translation.mjs:*)'],
    { stdio: ['ignore', 'inherit', 'inherit'], timeout: 30 * 60 * 1000 }
  );
  if (run.error) return { issues: [`claude failed to run: ${run.error.message}`] };
  if (run.status !== 0) return { issues: [`claude exited with ${run.status}`] };
  return { issues: [] };
}

// ── Gemini API：模型只負責回傳整個檔案，寫檔、檢查、退回修正都由這裡做 ─────────

const GEMINI = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
let geminiModelList;

async function geminiModels(key) {
  if (process.env.GEMINI_MODEL) return [{ name: process.env.GEMINI_MODEL }];
  if (geminiModelList) return geminiModelList;
  const res = await fetch(`${GEMINI}/models?pageSize=1000`, { headers: { 'x-goog-api-key': key } });
  if (!res.ok) throw new Error(`Gemini: listing models failed (${res.status} ${(await res.text()).slice(0, 200)})`);
  // gemini-<版本>-pro / -flash（可帶 -preview…）；pro 優先、版本新的優先、同版本正式版優先
  const rank = (name) => {
    const m = name.match(/^gemini-(\d+(?:\.\d+)?)-(pro|flash)(-preview(?:-[\w-]+)?)?$/);
    return m && [m[2] === 'pro' ? 1 : 0, Number(m[1]), m[3] ? 0 : 1];
  };
  const list = ((await res.json()).models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => ({ name: m.name.replace(/^models\//, ''), limit: m.outputTokenLimit }))
    .filter((m) => rank(m.name))
    .sort((a, b) => { const x = rank(a.name), y = rank(b.name); return y[0] - x[0] || y[1] - x[1] || y[2] - x[2]; });
  // pro 的額度用完或免費方案不開放時，退到 flash
  const pros = list.filter((m) => rank(m.name)[0] === 1), flashes = list.filter((m) => rank(m.name)[0] === 0);
  geminiModelList = [...pros.slice(0, 2), ...flashes.slice(0, 1)];
  if (!geminiModelList.length) throw new Error('Gemini: no usable model found for this key');
  return geminiModelList;
}

async function geminiGenerate(key, system, contents) {
  const errors = [];
  for (const m of await geminiModels(key)) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await fetch(`${GEMINI}/models/${m.name}:generateContent`, {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          ...(m.limit ? { generationConfig: { maxOutputTokens: m.limit } } : {}),
        }),
        signal: AbortSignal.timeout(10 * 60 * 1000),
      }).catch((err) => ({ ok: false, status: 0, json: async () => ({ error: { message: err.message } }) }));
      const data = await res.json().catch(() => ({}));
      const cand = data.candidates?.[0];
      const text = (cand?.content?.parts ?? []).filter((x) => !x.thought).map((x) => x.text ?? '').join('');
      if (res.ok && text.trim() && cand.finishReason !== 'MAX_TOKENS') {
        console.log(`  gemini: answered by ${m.name}`);
        return text;
      }
      const why = data.error?.message ?? cand?.finishReason ?? 'empty response';
      errors.push(`${m.name}: ${res.status} ${String(why).slice(0, 160)}`);
      console.log(`  gemini: ${m.name} → ${res.status} ${String(why).slice(0, 120)}`);
      // 每分鐘次數上限：等一下再試同一個模型；暫時性錯誤換下一個模型；
      // 這把 key 不能用的模型（404、403、400）這次執行就不再試
      if (res.status === 429 && attempt === 1) { await new Promise((r) => setTimeout(r, 45_000)); continue; }
      if ([400, 403, 404].includes(res.status)) geminiModelList = geminiModelList?.filter((x) => x !== m);
      break;
    }
  }
  throw new Error(`Gemini failed: ${errors.join(' | ')}`);
}

const slugify = (t) =>
  String(t ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function slugFile(wanted, title, mine) {
  let s = slugify(wanted) || slugify(title) || 'essay';
  if (s.length > 60) s = s.slice(0, 61).replace(/-[^-]*$/, '') || s.slice(0, 60);
  let name = s;
  for (let n = 2; fs.existsSync(path.join(EN_DIR, `${name}.md`)) && path.join(EN_DIR, `${name}.md`) !== mine; n++) name = `${s}-${n}`;
  return path.join(EN_DIR, `${name}.md`);
}

// 模型回傳的文字 → 英文檔內容（拿掉外層 code fence 與前言，補齊 original / sourceHash）
function toFile(text, p, oldHash) {
  let out = text.trim();
  // 整個檔案被包在 ```markdown … ``` 裡（前面可能還有一句說明）
  const fenced = out.match(/(?:^|\n)```(?:markdown|md|yaml)?[ \t]*\n(---[\s\S]*?)\n```\s*$/);
  if (fenced) out = fenced[1].trim();
  const start = out.search(/^---[ \t]*$/m);
  if (start > 0) out = out.slice(start);
  const fm = matter(out); // YAML 壞掉會丟錯，交給上層退回修正
  const { slug, ...data } = fm.data;
  const fixed = { original: p.id, title: data.title, description: data.description, tags: data.tags ?? [], sourceHash: oldHash ?? 'pending' };
  for (const k of Object.keys(fixed)) if (fixed[k] === undefined) delete fixed[k]; // 缺的欄位交給檢查回報
  // 欄位都對、也沒有 slug 的話保留原文字（更新時 frontmatter 不會被重新排版）
  const same = slug === undefined && String(data.original) === p.id && String(data.sourceHash) === fixed.sourceHash && Object.keys(data).length === 5;
  return { slug, title: data.title, text: same ? `${out}\n` : matter.stringify(fm.content.startsWith('\n') ? fm.content : `\n${fm.content}`, fixed) };
}

async function gemini(p) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { issues: ['GEMINI_API_KEY is not set'] };
  const guide = fs.readFileSync('docs/translating.md', 'utf8');
  const source = fs.readFileSync(p.file, 'utf8');
  const current = p.en ? fs.readFileSync(p.en, 'utf8') : null;
  const oldHash = p.en ? String(matter(current).data.sourceHash) : null;
  const example = fs.readFileSync(path.join(EN_DIR, 'ai-lacks-memory-that-builds-up.md'), 'utf8');
  const ask =
    p.mode === 'new'
      ? `Translate this essay by ChiChieh Huang from Traditional Chinese into English, following the guide in your instructions.

Return the complete English markdown file and nothing else: YAML frontmatter with original: ${p.id}, slug, title, description, tags and sourceHash: pending, then the translated body. "slug" is the URL slug described in the guide; the pipeline uses it as the file name and removes it from the frontmatter. You cannot run the checker yourself: the pipeline runs it and sends back any problems.

Slugs already taken: ${english().map((e) => e.id).join(', ')}

An existing translation, for tone only:
<example>
${example}
</example>

The Chinese source (its frontmatter holds the Chinese title, description and tags; the title is not repeated in the body):
<source>
${source}
</source>`
      : `The Chinese original of this essay changed after it was translated. Update the English file to match the current Chinese, following "Updating an existing translation" in your instructions: translate added or rewritten passages, remove deleted ones, and leave everything unchanged exactly as it is, including the frontmatter.

Return the complete updated English file and nothing else. You cannot run the checker yourself: the pipeline runs it and sends back any problems.

The current Chinese source:
<source>
${source}
</source>

The current English file:
<english>
${current}
</english>`;

  const contents = [{ role: 'user', parts: [{ text: ask }] }];
  let file = p.en ?? null;
  let issues = [];
  for (let round = 1; round <= 3; round++) {
    const answer = await geminiGenerate(key, guide, contents);
    try {
      const out = toFile(answer, p, oldHash);
      if (!p.en) {
        const next = slugFile(out.slug, out.title, file);
        if (file && file !== next) fs.rmSync(file, { force: true });
        file = next;
      }
      fs.writeFileSync(file, out.text);
      issues = check(file);
    } catch (err) {
      issues = [`the file could not be parsed: ${err.message.split('\n')[0]}`];
    }
    if (!issues.length) return { file, issues };
    console.log(`  round ${round}: ${issues.length} problem(s)${round < 3 ? ', asking for a fix' : ''}\n    - ${issues.join('\n    - ')}`);
    contents.push(
      { role: 'model', parts: [{ text: answer }] },
      { role: 'user', parts: [{ text: `The checker found these problems:\n- ${issues.join('\n- ')}\n\nFix them and return the complete corrected file again, nothing else.` }] }
    );
  }
  return { file, issues };
}

// ── 逐篇翻譯：引擎依序試，通過檢查才留下 ───────────────────────────

const ENGINES = { claude, gemini };
for (const e of engines) if (!ENGINES[e]) throw new Error(`unknown engine "${e}" (use ${Object.keys(ENGINES).join(', ')})`);

const safe = (fn, fallback) => { try { return fn(); } catch (err) { return fallback(err); } };
const results = [];
for (const p of todo) {
  const before = new Set(fs.readdirSync(EN_DIR));
  const snapshot = new Map([...before].map((f) => [path.join(EN_DIR, f), fs.readFileSync(path.join(EN_DIR, f), 'utf8')]));
  const backup = p.en ? snapshot.get(p.en) : null;
  const tried = [];
  let done = null;
  for (const engine of engines) {
    console.log(`\n▶ ${p.mode} ${p.id} (${engine})`);
    const run = await Promise.resolve().then(() => ENGINES[engine](p)).catch((err) => ({ issues: [err.message] }));
    // 這次新增的英文檔（新文章）或原本那篇（更新）
    const created = fs.readdirSync(EN_DIR).filter((f) => !before.has(f)).map((f) => path.join(EN_DIR, f));
    const file = p.en ?? run.file ?? safe(() => english().find((e) => e.original === p.id && created.includes(e.file))?.file, () => (created.length === 1 ? created[0] : undefined));
    // 只准動這一篇：多出來的檔案刪掉，其他英文檔被改到的話一律還原（先清乾淨再檢查）
    for (const f of created) if (f !== file) fs.rmSync(f, { force: true });
    for (const [f, text] of snapshot) if (f !== p.en && (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== text)) fs.writeFileSync(f, text);
    const issues = [...run.issues];
    if (!issues.length) {
      if (!file || !fs.existsSync(file)) issues.push('no English file was written');
      else issues.push(...safe(() => check(file), (err) => [`the file could not be checked: ${err.message.split('\n')[0]}`]));
    }
    if (!issues.length) {
      done = { file, engine };
      break;
    }
    // 沒通過：新文章刪掉、更新還原，再換下一個引擎
    if (file && !p.en) fs.rmSync(file, { force: true });
    if (backup !== null) fs.writeFileSync(p.en, backup);
    tried.push(`${engine}: ${issues.join('; ')}`);
    console.log(`✗ ${p.id} (${engine})\n  - ${issues.join('\n  - ')}`);
  }
  if (done) {
    stamp([done.file]);
    results.push({ ...p, ok: true, en: done.file, engine: done.engine });
    console.log(`✓ ${p.id} → ${done.file} (${done.engine})`);
  } else {
    results.push({ ...p, ok: false, issues: tried });
  }
}

const ok = results.filter((r) => r.ok), failed = results.filter((r) => !r.ok);
const summary = [
  `### English translations`,
  ...ok.map((r) => `- ✓ ${r.mode === 'new' ? 'translated' : 'updated'} **${r.title}** → \`${r.en}\` (${r.engine})`),
  ...failed.map((r) => `- ✗ **${r.title}** (\`${r.file}\`): ${r.issues.join(' / ')}`),
  ...(later.length ? [`- ${later.length} more left for the next run`] : []),
].join('\n');
console.log(`\n${summary}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
// 給 workflow 寫 commit 訊息用
if (process.env.GITHUB_OUTPUT) {
  const titles = ok.map((r) => `- ${r.title} (${r.engine})`).join('\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `translated=${ok.length}\ntitles<<EOF\n${titles}\nEOF\n`);
}
process.exit(failed.length ? 1 : 0);
