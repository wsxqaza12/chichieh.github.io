// 分享卡片（og:image，1200×630）：每篇文章一張，畫的是這篇在寫作地形圖上的位置。
// 建置時產生：地形與等高線用跟網站同一套計算，文字用 resvg 排版，最後轉成 JPEG。
// 字型在建置時從 Google Fonts 下載（快取在 .cache/og-fonts），下載失敗時卡片照樣產生、只是沒有文字。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';
import { makeModel, type Model, type Pt } from './terrain/model';
import { sampleField, shadeField, contourLevels, cairnStones, type View } from './terrain/field';
import { REGIONS } from './regions';
import { getSummaries, type PostSummary } from './posts';
import { seriesOf, resolveSeries } from '../data/series';
import { fitTitle } from './og-text.ts';

const W = 1200, H = 630;
// 夜間測繪色票（與 global.css 的深色 tokens 相同）
const C = {
  ground: '#0E1613', groundHi: '#1E2B25', contour: '#3A5446', contourMajor: '#5E7D68',
  shadeHi: [255, 255, 240], shadeLo: [0, 0, 0], shadeK: 1,
  ink: '#E8EAE1', ink2: '#97A49A', ink3: '#66756B', trail: '#F2B05C', line: '#2C3D34',
};
const SANS = 'Noto Sans TC', MONO = 'Martian Mono';

/* ── 字型 ── */
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;500&family=Martian+Mono:wght@500';
const CACHE = path.join('.cache', 'og-fonts');
let fontsP: Promise<string[]> | null = null;
function fonts(): Promise<string[]> {
  fontsP ??= (async () => {
    fs.mkdirSync(CACHE, { recursive: true });
    const cached = () => fs.readdirSync(CACHE).filter((f) => f.endsWith('.ttf')).map((f) => path.join(CACHE, f));
    try {
      // 舊式 User-Agent 會拿到完整的 TTF（新瀏覽器拿到的是切片 woff2，resvg 讀不了）
      const css = await (await fetch(FONT_CSS, { headers: { 'User-Agent': 'curl/8.0' } })).text();
      const urls = [...css.matchAll(/src: url\(([^)]+\.ttf)\)/g)].map((m) => m[1]);
      if (!urls.length) throw new Error('no ttf in css');
      const files: string[] = [];
      for (const u of urls) {
        const f = path.join(CACHE, 'f' + u.split('/').pop()!);
        if (!fs.existsSync(f)) fs.writeFileSync(f, Buffer.from(await (await fetch(u)).arrayBuffer()));
        files.push(f);
      }
      return files;
    } catch (e) {
      const files = cached();
      if (!files.length) console.warn(`og: 下載不到字型，分享卡片不會有文字（${(e as Error).message}）`);
      return files;
    }
  })();
  return fontsP;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/* ── 地形底圖 ── */
async function terrainLayer(m: Model, v: View) {
  const f = sampleField(m, v, W, H, 4);
  const rgba = shadeField(f, C);
  const png = await sharp(Buffer.from(rgba), { raw: { width: f.gw, height: f.gh, channels: 4 } })
    .resize(f.gw * f.G, f.gh * f.G, { kernel: 'cubic' })
    .extract({ left: 0, top: 0, width: W, height: H })
    .png()
    .toBuffer();
  let minor = '', major = '';
  for (const { major: mj, seg } of contourLevels(f, Math.round(26 * Math.max(1, 1440 / v.w / 1.2)), 5 * Math.max(1, Math.round(1440 / v.w / 1.2)))) {
    let d = '';
    for (let i = 0; i < seg.length; i += 4) d += `M${seg[i].toFixed(1)} ${seg[i + 1].toFixed(1)}L${seg[i + 2].toFixed(1)} ${seg[i + 3].toFixed(1)}`;
    if (mj) major += d; else minor += d;
  }
  return `<image href="data:image/png;base64,${png.toString('base64')}" width="${W}" height="${H}"/>
<path d="${minor}" fill="none" stroke="${C.contour}" stroke-width="0.8" opacity="0.7"/>
<path d="${major}" fill="none" stroke="${C.contourMajor}" stroke-width="1.3" opacity="0.9"/>`;
}

function marks(m: Model, v: View, target: Pt | null, series: Pt[]) {
  const k = W / v.w, X = (x: number) => (x - v.x) * k, Y = (y: number) => (y - v.y) * k;
  const cs = target ? 1.6 : 1;
  let s = `<path d="${m.trail.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('')}" fill="none" stroke="${C.ground}" stroke-width="6" opacity="0.6"/>`;
  s += `<path d="${m.trail.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('')}" fill="none" stroke="${C.trail}" stroke-width="2.4" stroke-dasharray="7 6" stroke-linecap="round" opacity="${target ? 0.6 : 0.95}"/>`;
  if (series.length > 1) {
    const d = series.map((q, i) => `${i ? 'L' : 'M'}${X(q.x).toFixed(1)} ${(Y(q.y) - 8).toFixed(1)}`).join('');
    s += `<path d="${d}" fill="none" stroke="${C.ground}" stroke-width="8"/><path d="${d}" fill="none" stroke="${C.trail}" stroke-width="2.6"/>`;
  }
  for (let i = m.pts.length - 1; i >= 0; i--) {
    const q = m.pts[i], x = X(q.x), y = Y(q.y);
    if (x < -30 || y < -30 || x > W + 30 || y > H + 30 || q === target) continue;
    const strong = !target || series.includes(q);
    for (const st of cairnStones(x, y, q.p.n, strong ? cs : cs * 0.85))
      s += `<ellipse cx="${st.cx.toFixed(1)}" cy="${st.cy.toFixed(1)}" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="${C.trail}" stroke="${C.ground}" stroke-width="2" opacity="${strong ? 1 : 0.5}"/>`;
  }
  if (target) {
    const x = X(target.x), y = Y(target.y);
    s += `<circle cx="${x.toFixed(1)}" cy="${(y - 12).toFixed(1)}" r="34" fill="none" stroke="${C.trail}" stroke-width="2"/>`;
    s += `<circle cx="${x.toFixed(1)}" cy="${(y - 12).toFixed(1)}" r="56" fill="none" stroke="${C.trail}" stroke-width="1.2" opacity="0.45"/>`;
    for (const st of cairnStones(x, y, target.p.n, 2.4))
      s += `<ellipse cx="${st.cx.toFixed(1)}" cy="${st.cy.toFixed(1)}" rx="${st.rx.toFixed(1)}" ry="${st.ry.toFixed(1)}" fill="${C.trail}" stroke="${C.ground}" stroke-width="2.6"/>`;
  }
  return s;
}

function frame(withText: boolean, kicker: string, title: string, meta: string) {
  // 左側壓暗，讓文字讀得清楚；外框是地圖的圖廓線
  let s = `<defs><linearGradient id="shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${C.ground}" stop-opacity="0.94"/><stop offset="0.5" stop-color="${C.ground}" stop-opacity="0.78"/><stop offset="0.78" stop-color="${C.ground}" stop-opacity="0"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#shade)"/>`;
  s += `<rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${C.line}" stroke-width="1.5"/>`;
  for (let x = 22 + 60; x < W - 22; x += 60) s += `<line x1="${x}" x2="${x}" y1="${H - 22}" y2="${H - 30}" stroke="${C.ink3}" stroke-width="1"/>`;
  if (!withText) return s;
  const { size, lines } = fitTitle(title, 640);
  const lh = size * 1.22, top = 168;
  s += `<text x="72" y="104" font-family="${MONO}" font-weight="500" font-size="17" letter-spacing="3" fill="${C.ink2}">${esc(kicker)}</text>`;
  lines.forEach((l, i) => (s += `<text x="68" y="${(top + size * 0.88 + i * lh).toFixed(0)}" font-family="${SANS}" font-weight="300" font-size="${size}" fill="${C.ink}" stroke="${C.ground}" stroke-width="8" stroke-opacity="0.6" paint-order="stroke" stroke-linejoin="round">${esc(l)}</text>`));
  const my = top + lines.length * lh + 46;
  s += `<text x="72" y="${my.toFixed(0)}" font-family="${MONO}" font-weight="500" font-size="21" letter-spacing="1" fill="${C.trail}">${esc(meta)}</text>`;
  // 署名
  s += `<circle cx="88" cy="${H - 82}" r="15" fill="none" stroke="${C.trail}" stroke-width="2"/><circle cx="88" cy="${H - 82}" r="4" fill="${C.trail}"/>`;
  s += `<text x="116" y="${H - 74}" font-family="${SANS}" font-weight="500" font-size="24" letter-spacing="3" fill="${C.ink}">黃琪婕</text>`;
  s += `<text x="214" y="${H - 75}" font-family="${MONO}" font-weight="500" font-size="15" letter-spacing="2.5" fill="${C.ink2}">CHICHIEH HUANG</text>`;
  s += `<text x="${W - 72}" y="${H - 75}" text-anchor="end" font-family="${MONO}" font-weight="500" font-size="16" letter-spacing="2" fill="${C.ink2}" stroke="${C.ground}" stroke-width="6" paint-order="stroke" stroke-linejoin="round">chichieh-huang.com</text>`;
  return s;
}

async function render(svg: string) {
  const files = await fonts();
  const r = new Resvg(svg, { font: { fontFiles: files, loadSystemFonts: false, defaultFontFamily: SANS }, fitTo: { mode: 'width', value: W } });
  return sharp(r.render().asPng()).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

let modelP: Promise<Model> | null = null;
const model = () => (modelP ??= getSummaries().then((s) => makeModel(s, 'h')));

/** 單篇文章的分享卡片 */
export async function postCard(id: string, meta: { title: string; date: string; chars: number; minutes: number }) {
  const m = await model();
  const target = m.pts.find((q) => q.p.id === id) ?? null;
  const place = seriesOf(id);
  const series = place ? resolveSeries(place.series, m.pts.map((q) => q.p.id)).flatMap((s) => s.posts).map((sid) => m.pts.find((q) => q.p.id === sid)).filter((q): q is Pt => !!q) : [];
  // 把這篇放在畫面右側偏中，放大到看得出附近的石堆
  const vw = 520, vh = (vw * H) / W;
  const cx = target ? target.x : m.VW / 2, cy = target ? target.y : m.VH / 2;
  const v: View = { x: cx - vw * 0.72, y: cy - vh * 0.56, w: vw, h: vh };
  const r = REGIONS[target?.k ?? 0];
  const kicker = place
    ? `${r.key}${r.suffix} · ${place.series.name.toUpperCase()} · S${place.season.n}·${place.ep}`
    : `寫作地形圖 · ${r.key}${r.suffix} · ${r.en}`;
  const files = await fonts();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.ground}"/>${await terrainLayer(m, v)}${marks(m, v, target, series)}${frame(files.length > 0, kicker, meta.title, `${meta.date} · ${meta.chars.toLocaleString('en-US')} 字 · 約 ${meta.minutes} 分鐘`)}</svg>`;
  return render(svg);
}

/** 首頁與其他頁面共用的卡片：整張地圖 */
export async function siteCard(lang: 'zh' | 'en' = 'zh') {
  const m = await model();
  const posts: PostSummary[] = await getSummaries();
  const total = posts.reduce((n, p) => n + p.n, 0);
  const vh = (m.VW * H) / W;
  const v: View = { x: 0, y: (m.VH - vh) / 2 + 20, w: m.VW, h: vh };
  const files = await fonts();
  const years = Math.max(1, Math.round((Date.now() - Date.parse(posts[posts.length - 1].d)) / (365.25 * 864e5)));
  const zh = ['零', '一', '兩', '三', '四', '五', '六', '七', '八', '九', '十'][years] ?? String(years);
  const enN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][years] ?? String(years);
  const text = lang === 'en'
    ? ['A MAP OF MY WRITING · FOUNDER · AI ENGINEER', `${enN} years of writing, one cairn at a time.`, `${posts.length} essays · ${total.toLocaleString('en-US')} characters`]
    : ['寫作地形圖 · GENERATIVE AI', `${zh}年的寫作，走成一座山。`, `${posts.length} 篇文章 · ${total.toLocaleString('en-US')} 字`];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.ground}"/>${await terrainLayer(m, v)}${marks(m, v, null, [])}${frame(files.length > 0, text[0], text[1], text[2])}</svg>`;
  return render(svg);
}
