// 地形的像素與等高線計算，不碰 DOM：瀏覽器的 canvas 與建置時的分享卡片共用。
import type { Model } from './model';

export interface View { x: number; y: number; w: number; h: number }

export interface Palette {
  ground: string; groundHi: string; contour: string; contourMajor: string;
  shadeHi: number[]; shadeLo: number[]; shadeK: number;
}

export interface Field { hh: Float32Array; gw: number; gh: number; G: number; k: number; mn: number; mx: number }

/** 在 view 視窗（模型座標）上，以每 G 個輸出像素取一個高度 */
export function sampleField(m: Model, v: View, W: number, H: number, G: number): Field {
  const gw = Math.ceil(W / G) + 1, gh = Math.ceil(H / G) + 1, k = v.w / W;
  const [mn, mx] = m.range();
  const hh = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) hh[j * gw + i] = m.h(v.x + i * G * k, v.y + j * G * k);
  return { hh, gw, gh, G, k, mn, mx };
}

const hexRGB = (s: string) => {
  s = s.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

/** 高度色 + 西北光源的地形陰影，回傳 gw×gh 的 RGBA */
export function shadeField(f: Field, col: Palette): Uint8ClampedArray {
  const { hh, gw, gh, k, mn, mx } = f;
  const c0 = hexRGB(col.ground), c1 = hexRGB(col.groundHi), hi = col.shadeHi, lo = col.shadeLo;
  const out = new Uint8ClampedArray(gw * gh * 4);
  const z = 26 / (mx - mn) / k;
  for (let j = 0; j < gh; j++)
    for (let i = 0; i < gw; i++) {
      const o = (j * gw + i) * 4, e = (hh[j * gw + i] - mn) / (mx - mn);
      const t = Math.pow(Math.min(1, Math.max(0, (e - 0.15) / 0.85)), 1.2);
      let R = c0[0] + (c1[0] - c0[0]) * t, G = c0[1] + (c1[1] - c0[1]) * t, B = c0[2] + (c1[2] - c0[2]) * t;
      if (i > 0 && j > 0 && i < gw - 1 && j < gh - 1) {
        const dx = ((hh[j * gw + i + 1] - hh[j * gw + i - 1]) * z) / 2, dy = ((hh[(j + 1) * gw + i] - hh[(j - 1) * gw + i]) * z) / 2;
        const len = Math.hypot(dx, dy, 1);
        let s = (dx * 0.6 + dy * 0.6 + 0.53) / len - 0.53;
        s = Math.max(-1, Math.min(1, s * 1.6)) * col.shadeK;
        const tg = s > 0 ? hi : lo, a = s > 0 ? s * 0.22 : -s * 0.3;
        R += (tg[0] - R) * a; G += (tg[1] - G) * a; B += (tg[2] - B) * a;
      }
      out[o] = R; out[o + 1] = G; out[o + 2] = B; out[o + 3] = 255;
    }
  return out;
}

/** marching squares：每一層等高線的線段（輸出像素座標，x0,y0,x1,y1 連續排列） */
export function contourLevels(f: Field, levels: number, majorEvery: number) {
  const { hh, gw, gh, G, mn, mx } = f;
  const step = (mx - mn) / levels;
  const out: { major: boolean; seg: number[] }[] = [];
  for (let L = 1; L < levels; L++) {
    const iso = mn + L * step, seg: number[] = [];
    for (let j = 0; j < gh - 1; j++)
      for (let i = 0; i < gw - 1; i++) {
        const a = hh[j * gw + i], b = hh[j * gw + i + 1], c = hh[(j + 1) * gw + i + 1], d = hh[(j + 1) * gw + i];
        const id = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (id === 0 || id === 15) continue;
        const x = i * G, y = j * G;
        const top = [x + (G * (iso - a)) / (b - a), y], right = [x + G, y + (G * (iso - b)) / (c - b)];
        const bot = [x + (G * (iso - d)) / (c - d), y + G], left = [x, y + (G * (iso - a)) / (d - a)];
        const sg = (p: number[], q: number[]) => seg.push(p[0], p[1], q[0], q[1]);
        switch (id) {
          case 1: case 14: sg(left, bot); break;
          case 2: case 13: sg(bot, right); break;
          case 3: case 12: sg(left, right); break;
          case 4: case 11: sg(top, right); break;
          case 5: sg(left, top); sg(bot, right); break;
          case 6: case 9: sg(top, bot); break;
          case 7: case 8: sg(left, top); break;
          case 10: sg(top, right); sg(left, bot); break;
        }
      }
    out.push({ major: L % majorEvery === 0, seg });
  }
  return out;
}

/** 石堆的石頭（由下往上）：字數越多石頭越多 */
export function cairnStones(x: number, y: number, n: number, scale = 1) {
  const stones = n < 900 ? 2 : n < 2600 ? 3 : 4, base = (n < 900 ? 5.5 : n < 2600 ? 7 : 8.5) * scale;
  const out: { cx: number; cy: number; rx: number; ry: number }[] = [];
  let yy = y;
  for (let s = 0; s < stones; s++) {
    const rx = base * (1 - s * 0.2), ry = rx * 0.42;
    out.push({ cx: x + (s % 2 ? 0.6 : -0.4) * scale, cy: yy - ry, rx, ry });
    yy -= ry * 1.75;
  }
  return out;
}
