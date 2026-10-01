// 寫作地形：把文章（時間 × 區域）變成一張確定性的地形。
// 純計算、不碰 DOM，建置時（找附近的文章）與瀏覽器（畫地圖）共用同一份。
import { REGIONS } from '../regions';
import type { PostSummary } from '../posts';

export type Orient = 'h' | 'v';

export interface Pt {
  p: PostSummary;
  k: number; // region index
  u: number; // time 0..1
  v: number; // region 0..1 (south → north)
  x: number;
  y: number;
}

export interface Model {
  orient: Orient;
  VW: number;
  VH: number;
  pts: Pt[];
  trail: [number, number][];
  h: (x: number, y: number) => number;
  range: () => [number, number];
  T0: number;
  T1: number;
  /** 地圖座標 → 指定時間/區域位置 */
  at: (u: number, v: number) => [number, number];
  /** 時間 u 的單位長度（每 1.0 u 幾個地圖單位） */
  span: number;
}

const DIMS = {
  h: { VW: 1440, VH: 835, m: { l: 0.05, r: 0.05, t: 0.13, b: 0.1 } },
  v: { VW: 600, VH: 1800, m: { l: 0.1, r: 0.06, t: 0.05, b: 0.04 } },
};

export function makeModel(posts: PostSummary[], orient: Orient = 'h'): Model {
  const { VW, VH, m } = DIMS[orient];
  const PX = { x0: VW * m.l, x1: VW * (1 - m.r), y0: VH * m.t, y1: VH * (1 - m.b) };
  const T0 = Date.parse('2023-11-20');
  const last = Math.max(...posts.map((p) => Date.parse(p.d)));
  const T1 = Math.max(Date.parse('2026-10-25'), last + 30 * 864e5);
  const at = (u: number, v: number): [number, number] =>
    orient === 'h'
      ? [PX.x0 + u * (PX.x1 - PX.x0), PX.y1 - v * (PX.y1 - PX.y0)]
      : [PX.x0 + v * (PX.x1 - PX.x0), PX.y0 + (1 - u) * (PX.y1 - PX.y0)];
  const span = orient === 'h' ? PX.x1 - PX.x0 : PX.y1 - PX.y0;

  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const n = REGIONS.length;
  const idx = Object.fromEntries(REGIONS.map((r, i) => [r.key, i]));
  const pts: Pt[] = posts.map((p) => {
    const k = idx[p.topic] ?? 1;
    const u = (Date.parse(p.d) - T0) / (T1 - T0) + (rnd() - 0.5) * 0.008;
    const v = (k + 0.5) / n + ((rnd() - 0.5) * 0.62) / n;
    const [x, y] = at(u, v);
    return { p, k, u, v, x, y };
  });

  // value noise
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const hsh = (x: number, y: number) => perm[(perm[x & 255] + y) & 255] / 255;
  const sm = (t: number) => t * t * (3 - 2 * t);
  const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = hsh(xi, yi), b = hsh(xi + 1, yi), c = hsh(xi, yi + 1), d = hsh(xi + 1, yi + 1);
    const u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  const fbm = (x: number, y: number) => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.17;

  // trail: monthly centroids, 3-month weighted smoothing, Catmull-Rom
  const byM: Record<string, Pt[]> = {};
  pts.forEach((q) => (byM[q.p.d.slice(0, 7)] ??= []).push(q));
  const raw = Object.keys(byM).sort().map((k) => {
    const a = byM[k];
    return { u: a.reduce((s, q) => s + q.u, 0) / a.length, v: a.reduce((s, q) => s + q.v, 0) / a.length, n: a.length };
  });
  const cents = raw.map((c, i) => {
    if (i === raw.length - 1) return c;
    let su = 0, sv = 0, sw = 0;
    for (let j = Math.max(0, i - 1); j <= Math.min(raw.length - 1, i + 1); j++) {
      const w = (j === i ? 2 : 1) * raw[j].n;
      su += raw[j].u * w; sv += raw[j].v * w; sw += w;
    }
    return { u: su / sw, v: sv / sw, n: c.n };
  });
  const cps = cents.map((c) => at(c.u, c.v));
  const trail: [number, number][] = [];
  for (let i = 0; i < cps.length - 1; i++) {
    const p0 = cps[Math.max(0, i - 1)], p1 = cps[i], p2 = cps[i + 1], p3 = cps[Math.min(cps.length - 1, i + 2)];
    for (let s = 0; s < 16; s++) {
      const t = s / 16, t2 = t * t, t3 = t2 * t;
      const f = (k: 0 | 1) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      trail.push([f(0), f(1)]);
    }
  }
  if (cps.length) trail.push(cps[cps.length - 1]);

  const sr = Math.min(VW, VH) * 0.11 * (orient === 'v' ? 1.4 : 1);
  const ridge = trail.filter((_, i) => i % 3 === 0).map((p, i, a) => ({ x: p[0], y: p[1], w: 0.3 + 0.7 * Math.pow(i / Math.max(1, a.length - 1), 1.3) }));
  const sgx = orient === 'h' ? (PX.x1 - PX.x0) * 0.022 : (PX.x1 - PX.x0) * 0.055;
  const sgy = orient === 'h' ? (PX.y1 - PX.y0) * 0.055 : (PX.y1 - PX.y0) * 0.022;
  const P2 = pts.map((q) => ({ x: q.x, y: q.y, w: 0.05 + 0.16 * Math.sqrt(q.p.n / 7000) }));
  const h = (x: number, y: number) => {
    let r = 0;
    for (const q of ridge) {
      const dx = x - q.x, dy = y - q.y, d2 = (dx * dx + dy * dy) / (2 * sr * sr);
      if (d2 < 9) { const v = q.w * Math.exp(-d2); if (v > r) r = v; }
    }
    let e = 0.62 * r + 0.2 * fbm(x / 150 + 3, y / 150 + 7) + 0.06 * fbm(x / 40, y / 40);
    for (const q of P2) {
      const dx = (x - q.x) / sgx, dy = (y - q.y) / sgy, d2 = dx * dx + dy * dy;
      if (d2 < 16) e += q.w * Math.exp(-d2 / 2);
    }
    return e;
  };
  let rng: [number, number] | null = null;
  const range = (): [number, number] => {
    if (rng) return rng;
    let mn = 1e9, mx = -1e9;
    for (let y = 0; y <= VH; y += 10) for (let x = 0; x <= VW; x += 10) { const e = h(x, y); if (e < mn) mn = e; if (e > mx) mx = e; }
    return (rng = [mn, mx]);
  };
  return { orient, VW, VH, pts, trail, h, range, T0, T1, at, span };
}

/** 地圖上離某篇最近的文章（排除指定 id），建置時用來產生「附近的石堆」 */
export function nearest(model: Model, id: string, count: number, exclude: Set<string> = new Set()) {
  const me = model.pts.find((q) => q.p.id === id);
  if (!me) return [];
  return model.pts
    .filter((q) => q.p.id !== id && !exclude.has(q.p.id))
    .map((q) => ({ q, d: Math.hypot(q.x - me.x, q.y - me.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, count)
    .map(({ q }) => ({ post: q.p, days: Math.round(Math.abs(Date.parse(q.p.d) - Date.parse(me.p.d)) / 864e5) }));
}
