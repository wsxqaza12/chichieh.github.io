// 英文版翻譯的狀態：哪些文章還沒有英文版、哪些中文原文在翻譯之後又改過。
// 建置前會跑一次，只提醒、不擋建置（沒有英文版的文章，英文網站先不列）。
//   node scripts/i18n-status.mjs          → 摘要
//   node scripts/i18n-status.mjs --json   → 完整清單（給翻譯流程用）
//   node scripts/i18n-status.mjs --stamp [英文檔…] → 翻譯完成後，把中文原文目前的指紋寫進 sourceHash
//                                                  （不給檔名 = 所有 sourceHash: pending 的檔案）
// 要自動翻譯：npm run translate（見 scripts/translate.mjs）
import { english, originals, stamp, status } from './i18n-lib.mjs';

if (process.argv.includes('--stamp')) {
  const files = process.argv.slice(process.argv.indexOf('--stamp') + 1);
  const targets = files.length ? files : english().filter((e) => e.hash === 'pending').map((e) => e.file);
  for (const f of stamp(targets)) console.warn(`i18n: ${f} 的 original 找不到對應的中文文章`);
  console.log(`i18n: stamped ${targets.length} file(s)`);
} else if (process.argv.includes('--json')) {
  console.log(JSON.stringify(status(), null, 2));
} else {
  const { missing, stale, orphan } = status();
  const total = originals().length;
  console.log(`i18n: ${total - missing.length}/${total} 篇有英文版`);
  if (missing.length) console.warn(`i18n: ${missing.length} 篇還沒翻譯（英文網站先不列）：\n  ${missing.map((p) => p.file).join('\n  ')}`);
  if (stale.length) console.warn(`i18n: ${stale.length} 篇的中文原文在翻譯後改過：\n  ${stale.map((p) => `${p.file} → ${p.en}`).join('\n  ')}`);
  if (orphan.length) console.warn(`i18n: ${orphan.length} 篇英文版找不到中文原文：\n  ${orphan.map((e) => e.file).join('\n  ')}`);
}
