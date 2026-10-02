// 自動翻譯：找出還沒有英文版、或中文原文改過的文章，一篇一篇交給 Claude Code 翻譯（規則在 docs/translating.md），
// 翻完跑 check-translation 的檢查，通過才蓋 sourceHash；沒通過的不留檔，下次再翻。
//   npm run translate                         → 先同步文章，再翻（本機用你登入的 claude）
//   node scripts/translate.mjs [--limit 3] [--dry-run] [文章 id…]
// CI（.github/workflows/translate.yml）用 CLAUDE_CODE_OAUTH_TOKEN 或 ANTHROPIC_API_KEY。
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { EN_DIR, check, english, stamp, status } from './i18n-lib.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const limit = Number(opt('--limit', 3));
const model = process.env.TRANSLATE_MODEL || 'opus';
const only = args.filter((a, i) => !a.startsWith('--') && !['--limit'].includes(args[i - 1]));

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
console.log(`translate: ${todo.length} to do${later.length ? `, ${later.length} left for the next run` : ''}`);
for (const p of todo) console.log(`  ${p.mode === 'new' ? 'new   ' : 'update'} ${p.file}${p.en ? ` → ${p.en}` : ''}`);
if (flag('--dry-run')) process.exit(0);

const promptFor = (p) =>
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

const results = [];
for (const p of todo) {
  const before = new Set(fs.readdirSync(EN_DIR));
  const snapshot = new Map([...before].map((f) => [path.join(EN_DIR, f), fs.readFileSync(path.join(EN_DIR, f), 'utf8')]));
  const backup = p.en ? snapshot.get(p.en) : null;
  console.log(`\n▶ ${p.mode} ${p.id}`);
  const run = spawnSync(
    'claude',
    ['-p', promptFor(p), '--model', model, '--max-turns', '40', '--allowedTools', 'Read,Write,Edit,Glob,Grep,Bash(node scripts/check-translation.mjs:*)'],
    { stdio: ['ignore', 'inherit', 'inherit'], timeout: 30 * 60 * 1000 }
  );
  // 這次新增的英文檔（新文章）或原本那篇（更新）
  const created = fs.readdirSync(EN_DIR).filter((f) => !before.has(f)).map((f) => path.join(EN_DIR, f));
  const file = p.en ?? english().find((e) => e.original === p.id && created.includes(e.file))?.file;
  // 只准動這一篇：多出來的檔案刪掉，其他英文檔被改到的話一律還原（先清乾淨再檢查）
  for (const f of created) if (f !== file) fs.rmSync(f, { force: true });
  for (const [f, text] of snapshot) if (f !== p.en && (!fs.existsSync(f) || fs.readFileSync(f, 'utf8') !== text)) fs.writeFileSync(f, text);
  const issues = run.error ? [`claude failed to run: ${run.error.message}`] : run.status !== 0 ? [`claude exited with ${run.status}`] : [];
  if (!file) issues.push('no English file was written');
  else issues.push(...check(file));

  if (issues.length) {
    // 沒通過：新文章刪掉、更新還原，英文網站維持原樣
    if (file && !p.en) fs.rmSync(file, { force: true });
    if (backup !== null) fs.writeFileSync(p.en, backup);
    results.push({ ...p, ok: false, issues });
    console.log(`✗ ${p.id}\n  - ${issues.join('\n  - ')}`);
  } else {
    stamp([file]);
    results.push({ ...p, ok: true, en: file });
    console.log(`✓ ${p.id} → ${file}`);
  }
}

const ok = results.filter((r) => r.ok), failed = results.filter((r) => !r.ok);
const summary = [
  `### English translations`,
  ...ok.map((r) => `- ✓ ${r.mode === 'new' ? 'translated' : 'updated'} **${r.title}** → \`${r.en}\``),
  ...failed.map((r) => `- ✗ **${r.title}** (\`${r.file}\`): ${r.issues.join('; ')}`),
  ...(later.length ? [`- ${later.length} more left for the next run`] : []),
].join('\n');
console.log(`\n${summary}`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
// 給 workflow 寫 commit 訊息用
if (process.env.GITHUB_OUTPUT) {
  const titles = ok.map((r) => `- ${r.title}`).join('\n');
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `translated=${ok.length}\ntitles<<EOF\n${titles}\nEOF\n`);
}
process.exit(failed.length ? 1 : 0);
