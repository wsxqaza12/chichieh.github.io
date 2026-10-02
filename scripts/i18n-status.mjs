// 英文版翻譯的狀態：哪些文章還沒有英文版、哪些中文原文在翻譯之後又改過。
// 建置前會跑一次，只提醒、不擋建置（沒有英文版的文章，英文網站先不列）。
//   node scripts/i18n-status.mjs          → 摘要
//   node scripts/i18n-status.mjs --json   → 完整清單（給翻譯流程用）
//   node scripts/i18n-status.mjs --stamp [英文檔…] → 翻譯完成後，把中文原文目前的指紋寫進 sourceHash
//                                                  （不給檔名 = 所有 sourceHash: pending 的檔案）
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';

const read = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({ file: path.join(dir, f), ...matter(fs.readFileSync(path.join(dir, f), 'utf8')) }))
    : [];
// 跟 Astro 的 glob loader 一樣：檔名轉小寫、空白與符號換成 -（github-slugger 的規則）
const idOf = (file) => path.basename(file, '.md').toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
// 與 src/lib/posts.ts 的 sourceHash 相同
const hash = (body) => createHash('sha1').update(body.trim()).digest('hex').slice(0, 12);

const originals = [...read('src/content/blog'), ...read('src/content/synced')]
  .filter((p) => !p.data.draft && !p.data.translationOf)
  .map((p) => ({ id: idOf(p.file), file: p.file, title: p.data.title, hash: hash(p.content) }));
// String()：全是數字的指紋會被 YAML 讀成數字
const english = read('src/content/en').map((e) => ({ id: idOf(e.file), file: e.file, original: String(e.data.original), hash: String(e.data.sourceHash) }));
const byOriginal = new Map(english.map((e) => [e.original, e]));
const ids = new Set(originals.map((p) => p.id));

const missing = originals.filter((p) => !byOriginal.has(p.id));
const stale = originals.filter((p) => byOriginal.has(p.id) && byOriginal.get(p.id).hash !== p.hash).map((p) => ({ ...p, en: byOriginal.get(p.id).file }));
const orphan = english.filter((e) => !ids.has(e.original));

if (process.argv.includes('--stamp')) {
  const files = process.argv.slice(process.argv.indexOf('--stamp') + 1);
  const byId = new Map(originals.map((p) => [p.id, p]));
  const targets = files.length ? english.filter((e) => files.some((f) => path.resolve(f) === path.resolve(e.file))) : english.filter((e) => e.hash === 'pending');
  for (const e of targets) {
    const o = byId.get(e.original);
    if (!o) { console.warn(`i18n: ${e.file} 的 original「${e.original}」找不到`); continue; }
    const src = fs.readFileSync(e.file, 'utf8');
    fs.writeFileSync(e.file, src.replace(/^sourceHash:.*$/m, `sourceHash: '${o.hash}'`));
  }
  console.log(`i18n: stamped ${targets.length} file(s)`);
} else if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ missing, stale, orphan }, null, 2));
} else {
  console.log(`i18n: ${originals.length - missing.length}/${originals.length} 篇有英文版`);
  if (missing.length) console.warn(`i18n: ${missing.length} 篇還沒翻譯（英文網站先不列）：\n  ${missing.map((p) => p.file).join('\n  ')}`);
  if (stale.length) console.warn(`i18n: ${stale.length} 篇的中文原文在翻譯後改過：\n  ${stale.map((p) => `${p.file} → ${p.en}`).join('\n  ')}`);
  if (orphan.length) console.warn(`i18n: ${orphan.length} 篇英文版找不到中文原文：\n  ${orphan.map((e) => e.file).join('\n  ')}`);
}
