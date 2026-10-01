// 地形的 canvas 繪製（只在瀏覽器跑）。顏色全部從 CSS tokens 讀，深淺色切換時重畫即可。
import type { Model } from './model';
import { sampleField, shadeField, contourLevels, cairnStones, type View, type Palette } from './field';

export type { View } from './field';

export interface Colors extends Palette {
  trail: string; ink: string; ink2: string; ink3: string; line: string; halo: string;
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

export interface TerrainOpts { grid?: number; levels?: number; majorEvery?: number; minorW?: number; majorW?: number }

/** 把模型的 view 視窗畫進 ctx（W×H css px），含高度色、地形陰影與等高線 */
export function drawTerrain(ctx: CanvasRenderingContext2D, m: Model, v: View, W: number, H: number, col: Colors, opt: TerrainOpts = {}) {
  const f = sampleField(m, v, W, H, opt.grid ?? 4);
  const cv = document.createElement('canvas');
  cv.width = f.gw; cv.height = f.gh;
  const cx = cv.getContext('2d')!;
  const img = cx.createImageData(f.gw, f.gh);
  img.data.set(shadeField(f, col));
  cx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(cv, 0, 0, f.gw * f.G, f.gh * f.G);
  for (const { major, seg } of contourLevels(f, opt.levels ?? 26, opt.majorEvery ?? 5)) {
    ctx.beginPath();
    for (let i = 0; i < seg.length; i += 4) { ctx.moveTo(seg[i], seg[i + 1]); ctx.lineTo(seg[i + 2], seg[i + 3]); }
    ctx.strokeStyle = major ? col.contourMajor : col.contour;
    ctx.lineWidth = major ? opt.majorW ?? 1.1 : opt.minorW ?? 0.65;
    ctx.globalAlpha = major ? 0.9 : 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** 石堆：字數越多石頭越多（2～4 顆） */
export function drawCairn(ctx: CanvasRenderingContext2D, x: number, y: number, n: number, fill: string, ring: string, scale = 1) {
  for (const s of cairnStones(x, y, n, scale)) {
    ctx.beginPath();
    ctx.ellipse(s.cx, s.cy, s.rx, s.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.lineWidth = 1.6; ctx.strokeStyle = ring; ctx.stroke();
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
