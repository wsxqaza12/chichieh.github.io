// 檢查英文版：結構要跟中文原文對得上（圖片、標題、表格、code block、連結）、不能留中文、frontmatter 要齊。
// 自動翻譯（scripts/translate.mjs）每篇翻完都會跑；翻譯的 Claude 也會自己跑，有問題就改到通過。
//   node scripts/check-translation.mjs <英文檔…>
//   node scripts/check-translation.mjs --all
import { check, english } from './i18n-lib.mjs';

const args = process.argv.slice(2);
const files = args.includes('--all') ? english().map((e) => e.file) : args;
if (!files.length) {
  console.error('usage: node scripts/check-translation.mjs <src/content/en/…md> | --all');
  process.exit(2);
}
let bad = 0;
for (const file of files) {
  const issues = check(file);
  if (issues.length) bad++;
  console.log(issues.length ? `✗ ${file}\n  - ${issues.join('\n  - ')}` : `✓ ${file}`);
}
if (files.length > 1) console.log(`${files.length - bad}/${files.length} passed`);
process.exit(bad ? 1 : 0);
