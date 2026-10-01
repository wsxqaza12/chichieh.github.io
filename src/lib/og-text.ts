// 分享卡片的標題排版：resvg 不會自動換行，這裡估字寬並挑最好的斷行位置。
const CJK = /[⺀-鿿豈-﫿︰-﹏＀-￯　-〿]/;
function charW(ch: string, size: number) {
  if (CJK.test(ch)) return size;
  if (ch === ' ') return size * 0.26;
  if (/[A-Z]/.test(ch)) return size * 0.62;
  if (/[a-z0-9]/.test(ch)) return size * 0.54;
  return size * 0.34;
}
const width = (s: string, size: number) => [...s].reduce((a, ch) => a + charW(ch, size), 0);
const CLOSE = /^[，。、！？：；」』）》〉,.!?:;)\]…]/;
const OPEN = /[「『（《〈(\[]$/;
const GOOD = /[，、：；？！。|｜]$/;

/** 標題斷行：在所有可斷的位置裡找總成本最低的組合（標點後斷最便宜，兩個字中間斷最貴） */
export function wrap(text: string, size: number, max: number, maxLines = 3): { lines: string[]; bad: number } | null {
  const tk = text.match(/[A-Za-z0-9][A-Za-z0-9.\-_'’+#/]*|\s+|./gu) ?? [];
  const n = tk.length;
  const isSpace = (t: string) => /^\s+$/.test(t);
  // 在 token i 之後斷行的成本；Infinity = 不能斷
  const breakCost = (i: number) => {
    if (i >= n - 1) return 0;
    const a = tk[i], b = tk[i + 1];
    if (CLOSE.test(b) || OPEN.test(a)) return Infinity;
    if (GOOD.test(a)) return 0;
    if (isSpace(a) || isSpace(b)) return 18;
    const cjkA = CJK.test(a), cjkB = CJK.test(b);
    if (cjkA && cjkB) return 70;
    return 35; // 英文字與中文字之間
  };
  const lineText = (j: number, i: number) => tk.slice(j, i + 1).join('').trim();
  type S = { cost: number; prev: number; lines: number; bad: number };
  const best: S[] = Array.from({ length: n + 1 }, () => ({ cost: Infinity, prev: -1, lines: 0, bad: 0 }));
  best[0] = { cost: 0, prev: -1, lines: 0, bad: 0 };
  for (let i = 0; i < n; i++) {
    const bc = breakCost(i);
    if (bc === Infinity) continue;
    for (let j = 0; j <= i; j++) {
      if (best[j].cost === Infinity || best[j].lines >= maxLines) continue;
      const t = lineText(j, i);
      if (!t) continue;
      const w = width(t, size);
      if (w > max && i > j) continue; // 只有單一 token 太長時才允許超出
      const last = i === n - 1;
      const slack = Math.max(0, max - w) / max;
      const lineCost = (last ? (w < max * 0.22 ? 60 : 0) : slack * slack * 100) + 30;
      const c = best[j].cost + lineCost + bc;
      if (c < best[i + 1].cost) best[i + 1] = { cost: c, prev: j, lines: best[j].lines + 1, bad: best[j].bad + (bc >= 70 ? 1 : 0) };
    }
  }
  if (best[n].cost === Infinity) return null;
  const lines: string[] = [];
  for (let i = n; i > 0; ) { const j = best[i].prev; lines.unshift(lineText(j, i - 1)); i = j; }
  return { lines, bad: best[n].bad };
}

/** 字級由大到小試：優先選「不用把一個詞拆成兩行」的最大字級（最小到 46px），都不行就用能放下的最大字級 */
export function fitTitle(title: string, max: number) {
  let first: { size: number; lines: string[] } | null = null;
  for (const size of [68, 60, 52, 46]) {
    const r = wrap(title, size, max, size >= 60 ? 2 : 3);
    if (!r) continue;
    first ??= { size, lines: r.lines };
    if (r.bad === 0) return { size, lines: r.lines };
  }
  if (first) return first;
  for (const size of [40, 36]) { const r = wrap(title, size, max, 4); if (r) return { size, lines: r.lines }; }
  return { size: 36, lines: [title] };
}

