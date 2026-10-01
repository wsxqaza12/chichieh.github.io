// 地形的 canvas 繪製（只在瀏覽器跑）。顏色全部從 CSS tokens 讀，深淺色切換時重畫即可。
import type { Model } from './model';

export interface Colors {
  ground: string; groundHi: string; contour: string; contourMajor: string;
  trail: string; ink: string; ink2: string; ink3: string; line: string; halo: string;
  shadeHi: number[]; shadeLo: number[]; shadeK: number;
}

export function readColors(root: HTMLElement = document.documentElement): Colors {
  const cs = getComputedStyle(root);
  const g = (n: string) => cs.getPropertyValue(n).trim();
  return {
    ground: g('--ground'), groundHi: g('--ground-hi'), contour: g('--contour'), contourMajor: g('--contour-major'),
    trail: g('--trail'), ink: g('--ink'), ink2: g('--ink-2'), ink3: g('--ink-3'), line: g('--line'), halo: g('--halo'),
    shadeHi: g('--shade-hi').split(',').map(Number), shadeLo: g('--shade-lo').split(',').map(Number), shadeK: +g('--shade-k') || 1,
  };
}

const hexRGB = (s: string) => {
  s = s.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};

export interface View { x: number; y: number; w: number; h: number }
export interface TerrainOpts { grid?: number; levels?: number; majorEvery?: number; minorW?: number; majorW?: number }

/** 把模型的 view 視窗畫進 ctx（W×H css px），含高度色、地形陰影與等高線 */
export function drawTerrain(ctx: CanvasRenderingContext2D, m: Model, v: View, W: number, H: number, col: Colors, opt: TerrainOpts = {}) {
  const G = opt.grid ?? 4, gw = Math.ceil(W / G) + 1, gh = Math.ceil(H / G) + 1, k = v.w / W;
  const [mn, mx] = m.range();
  const hh = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) hh[j * gw + i] = m.h(v.x + i * G * k, v.y + j * G * k);
  const c0 = hexRGB(col.ground), c1 = hexRGB(col.groundHi), hi = col.shadeHi, lo = col.shadeLo;
  const cv = document.createElement('canvas');
  cv.width = gw; cv.height = gh;
  const cx = cv.getContext('2d')!;
  const img = cx.createImageData(gw, gh);
  const z = 26 / (mx - mn) / k;
  for (let j = 0; j < gh; j++)
    for (let i = 0; i < gw; i++) {
      const o = (j * gw + i) * 4, e = (hh[j * gw + i] - mn) / (mx - mn);
      const t = Math.pow(Math.min(1, Math.max(0, (e - 0.15) / 0.85)), 1.2);
      let R = c0[0] + (c1[0] - c0[0]) * t, Gc = c0[1] + (c1[1] - c0[1]) * t, B = c0[2] + (c1[2] - c0[2]) * t;
      if (i > 0 && j > 0 && i < gw - 1 && j < gh - 1) {
        const dx = ((hh[j * gw + i + 1] - hh[j * gw + i - 1]) * z) / 2, dy = ((hh[(j + 1) * gw + i] - hh[(j - 1) * gw + i]) * z) / 2;
        const len = Math.hypot(dx, dy, 1);
        let s = (dx * 0.6 + dy * 0.6 + 0.53) / len - 0.53; // 光從西北來
        s = Math.max(-1, Math.min(1, s * 1.6)) * col.shadeK;
        const tg = s > 0 ? hi : lo, a = s > 0 ? s * 0.22 : -s * 0.3;
        R += (tg[0] - R) * a; Gc += (tg[1] - Gc) * a; B += (tg[2] - B) * a;
      }
      img.data[o] = R; img.data[o + 1] = Gc; img.data[o + 2] = B; img.data[o + 3] = 255;
    }
  cx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cv, 0, 0, gw * G, gh * G);

  // 等高線（marching squares）
  const levels = opt.levels ?? 26, step = (mx - mn) / levels, majorEvery = opt.majorEvery ?? 5;
  for (let L = 1; L < levels; L++) {
    const iso = mn + L * step, major = L % majorEvery === 0;
    ctx.beginPath();
    for (let j = 0; j < gh - 1; j++)
      for (let i = 0; i < gw - 1; i++) {
        const a = hh[j * gw + i], b = hh[j * gw + i + 1], c = hh[(j + 1) * gw + i + 1], d = hh[(j + 1) * gw + i];
        const id = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (c > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (id === 0 || id === 15) continue;
        const x = i * G, y = j * G;
        const top = [x + (G * (iso - a)) / (b - a), y], right = [x + G, y + (G * (iso - b)) / (c - b)];
        const bot = [x + (G * (iso - d)) / (c - d), y + G], left = [x, y + (G * (iso - a)) / (d - a)];
        const sg = (p: number[], q: number[]) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
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
    ctx.strokeStyle = major ? col.contourMajor : col.contour;
    ctx.lineWidth = major ? opt.majorW ?? 1.1 : opt.minorW ?? 0.65;
    ctx.globalAlpha = major ? 0.9 : 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** 石堆：字數越多石頭越多（2～4 顆） */
export function drawCairn(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, fill: string, ring: string, scale = 1) {
  const stones = n < 900 ? 2 : n < 2600 ? 3 : 4, base = (n < 900 ? 5.5 : n < 2600 ? 7 : 8.5) * scale;
  let yy = y;
  for (let s = 0; s < stones; s++) {
    const rx = base * (1 - s * 0.2), ry = rx * 0.42;
    ctx.beginPath();
    ctx.ellipse(x + (s % 2 ? 0.6 : -0.4) * scale, yy - ry, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = ring; ctx.stroke();
    yy -= ry * 1.75;
  }
}

export function setupCanvas(cv: HTMLCanvasElement, W: number, H: number) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr);
  cv.height = Math.round(H * dpr);
  const ctx = cv.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
