// 英文版翻譯流程共用的部分：讀中文原文與英文版、算 id 與指紋、檢查與蓋章。
// i18n-status.mjs、check-translation.mjs、translate.mjs 都用這份。
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';

export const EN_DIR = 'src/content/en';

const read = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({ file: path.join(dir, f), ...matter(fs.readFileSync(path.join(dir, f), 'utf8')) }))
    : [];
// 跟 Astro 的 glob loader 一樣：檔名轉小寫、空白與符號換成 -（github-slugger 的規則）
export const idOf = (file) => path.basename(file, '.md').toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
// 與 src/lib/posts.ts 的 sourceHash 相同
export const hash = (body) => createHash('sha1').update(body.trim()).digest('hex').slice(0, 12);

export const originals = () =>
  [...read('src/content/blog'), ...read('src/content/synced')]
    .filter((p) => !p.data.draft && !p.data.translationOf)
    .map((p) => ({ id: idOf(p.file), file: p.file, title: p.data.title, hash: hash(p.content), body: p.content }));
// 作者自己在 Medium 寫過英文版的文章（blog 裡標了 translationOf）：英文版沿用作者原文，結構本來就不同
const authored = () => new Set(read('src/content/blog').filter((p) => p.data.translationOf).map((p) => String(p.data.translationOf)));
// String()：全是數字的指紋會被 YAML 讀成數字
export const english = () =>
  read(EN_DIR).map((e) => ({ id: idOf(e.file), file: e.file, original: String(e.data.original), hash: String(e.data.sourceHash), data: e.data, body: e.content }));

export function status() {
  const os = originals(), es = english();
  const byOriginal = new Map(es.map((e) => [e.original, e]));
  const ids = new Set(os.map((p) => p.id));
  const brief = ({ id, file, title, hash }) => ({ id, file, title, hash });
  return {
    missing: os.filter((p) => !byOriginal.has(p.id)).map(brief),
    stale: os.filter((p) => byOriginal.has(p.id) && byOriginal.get(p.id).hash !== p.hash).map((p) => ({ ...brief(p), en: byOriginal.get(p.id).file })),
    orphan: es.filter((e) => !ids.has(e.original)).map(({ id, file, original }) => ({ id, file, original })),
  };
}

// 把中文原文目前的指紋寫進英文檔的 sourceHash；回傳沒找到原文的檔案
export function stamp(files) {
  const byId = new Map(originals().map((p) => [p.id, p]));
  const lost = [];
  for (const e of english().filter((e) => files.some((f) => path.resolve(f) === path.resolve(e.file)))) {
    const o = byId.get(e.original);
    if (!o) { lost.push(e.file); continue; }
    const src = fs.readFileSync(e.file, 'utf8');
    fs.writeFileSync(e.file, src.replace(/^sourceHash:.*$/m, `sourceHash: '${o.hash}'`));
  }
  return lost;
}

// 中日韓文字、中文標點（「」、。）、全形符號（！？：（））
const CJK = /[㐀-鿿　-〿！-｠]/gu;
const HAS_CJK = new RegExp(CJK.source, 'u');
const FENCE = /^```[\s\S]*?^```/gm;
const count = (s, re) => (s.match(re) ?? []).length;
const targets = (s, re) => [...s.replace(FENCE, '').matchAll(re)].map((m) => m[1]);
const IMAGE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)/g;
const LINK = /(?<!!)\[[^\]]*\]\(\s*<?([^)\s>]+)/g;
const REF = /^\s{0,3}\[[^\]]+\]:\s*<?([^\s>]+)/gm; // [名稱]: 網址 這種參考式連結
// Medium 匯出的頁尾（「Post converted from Medium」）英文版不保留
const DROPPABLE = /medium\.com\/@cch\.chichieh|ZMediumToMarkdown/;

// 檢查一個英文檔，回傳問題清單（空陣列 = 通過）
export function check(file) {
  const issues = [];
  const name = path.basename(file);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(name)) issues.push(`file name must be lowercase ASCII words joined by "-" (got ${name})`);
  if (!fs.existsSync(file)) return [...issues, 'file does not exist'];
  const e = english().find((x) => path.resolve(x.file) === path.resolve(file));
  const o = originals().find((p) => p.id === e.original);
  if (!o) return [...issues, `original "${e.original}" does not match any Chinese post id`];
  const twins = english().filter((x) => x.original === e.original && x.file !== e.file);
  if (twins.length) issues.push(`another English file already translates "${e.original}": ${twins.map((x) => x.file).join(', ')}`);

  const { title, description, tags, sourceHash } = e.data;
  if (typeof title !== 'string' || !title.trim()) issues.push('title is missing');
  if (typeof description !== 'string' || !description.trim()) issues.push('description is missing');
  if (!Array.isArray(tags)) issues.push('tags must be a list (use [] for none)');
  if (sourceHash === undefined) issues.push('sourceHash is missing (write sourceHash: pending)');

  const cjk = (s) => [...new Set(String(s ?? '').match(CJK) ?? [])].join('');
  for (const [k, v] of [['title', title], ['description', description], ['tags', (tags ?? []).join(' ')]]) {
    if (cjk(v)) issues.push(`Chinese left in ${k}: ${cjk(v)}`);
  }
  const prose = e.body.replace(FENCE, ''), code = (e.body.match(FENCE) ?? []).join('\n');
  if (cjk(prose)) issues.push(`Chinese left in the text: ${cjk(prose).slice(0, 40)} (first line: ${prose.split('\n').find((l) => HAS_CJK.test(l))?.trim().slice(0, 80)})`);
  if (cjk(code)) issues.push(`Chinese left in code blocks: ${cjk(code).slice(0, 40)}`);

  if (authored().has(e.original)) return issues; // 作者自己的英文，不跟中文比結構
  for (const [k, re] of [['images', /!\[/g], ['## headings', /^## /gm], ['### headings', /^### /gm], ['tables', /^\s*\|?\s*:?-{3,}:?\s*\|/gm], ['code fences', /^```/gm]]) {
    const a = count(o.body, re), b = count(e.body, re);
    if (a !== b) issues.push(`${k}: Chinese has ${a}, English has ${b}`);
  }
  const zi = targets(o.body, IMAGE), ei = targets(e.body, IMAGE);
  if (zi.join('\n') !== ei.join('\n')) issues.push(`image paths must stay the same and in the same order (missing: ${zi.filter((u) => !ei.includes(u)).join(', ') || 'none'})`);
  const links = (s) => [...targets(s, LINK), ...targets(s, REF)];
  const el = new Set(links(e.body));
  const lost = [...new Set(links(o.body))].filter((u) => !el.has(u) && !DROPPABLE.test(u));
  if (lost.length) issues.push(`links dropped or changed: ${lost.join(', ')}`);
  return issues;
}
