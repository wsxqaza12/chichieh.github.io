// 文章內文的「野外紀錄」排版，在建置時改寫 HTML（hast），所有文章共用：
// - h2：「1. 標題」→ 編號標籤 + 標題；「結語：…」、「參考資料」也有標籤
// - 單獨一行的圖片 → 圖版（可放大），後面那行圖說（*圖 1　…* 或與 alt 相同的粗體）變成 figcaption
// - 表格包一層可橫向捲動的容器，每格補上欄名（手機版改成卡片時用）
// - 正文論文連結與文末「參考資料」清單 → 第一次引用處加上 [n]，並在段落後放引用註記
// - 第一段文字 → 引言（lede）；站外連結開新分頁
// 必須排在 rehypeHeadingIds 之後，這樣標題 id 與目錄不受影響。
// 英文版文章（src/content/en/）的標籤、圖說、按鈕用英文，連到其他文章的連結換成英文版網址。
import fs from 'node:fs';
import path from 'node:path';

const isEl = (n, tag) => n && n.type === 'element' && (!tag || n.tagName === tag);
const isBlank = (n) => n.type === 'text' && !n.value.trim();
const textOf = (n) => (n.type === 'text' ? n.value : (n.children || []).map(textOf).join(''));
const el = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
const txt = (value) => ({ type: 'text', value });
const addClass = (n, c) => {
  const cur = n.properties.className;
  n.properties.className = [...(Array.isArray(cur) ? cur : cur ? String(cur).split(' ') : []), c];
};

function stripPrefix(node, re) {
  for (const c of node.children || []) {
    if (c.type === 'text') {
      if (!c.value.trim()) continue;
      c.value = c.value.replace(re, '');
      return true;
    }
    if (isEl(c)) return stripPrefix(c, re);
  }
  return false;
}

function walk(node, fn, parent = null) {
  if (fn(node, parent) === false) return;
  for (const c of node.children || []) walk(c, fn, node);
}

const STR = {
  zh: { fig: (n) => `圖 ${n}`, zoom: (n) => `放大圖 ${n}`, table: '表格', note: (n) => `註 ${n}`, open: '開啟原文 ↗', link: '連結', references: '參考資料' },
  en: { fig: (n) => `Fig. ${n}`, zoom: (n) => `Enlarge figure ${n}`, table: 'Table', note: (n) => `Note ${n}`, open: 'Read the source ↗', link: 'link', references: 'References' },
};
let S = STR.zh;

// 不猜作者年份或論文名稱；只認已提供的論文網址。保留明確的版本號。
function paperUrl(href) {
  try {
    const u = new URL(href);
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'arxiv.org') {
      const m = u.pathname.match(/^\/(?:abs|html|pdf)\/((?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[A-Z]{2})?\/\d{7})(?:v\d+)?)(?:\.pdf)?\/?$/i);
      if (m) return `https://arxiv.org/abs/${m[1]}`;
    }
    if (host === 'doi.org' && /^\/10\.\d{4,9}\/.+/.test(u.pathname)) return `https://doi.org${u.pathname}`;
  } catch { /* 站內相對網址不是論文來源 */ }
  return null;
}
const normUrl = (u) => paperUrl(u) ?? String(u || '').replace(/#.*$/, '').replace(/\/+$/, '');

function headings(root) {
  for (const h of root.children) {
    if (!isEl(h, 'h2')) continue;
    const t = textOf(h).trim();
    let label = null, re = null;
    let m;
    if ((m = t.match(/^(\d{1,2})[.．、]\s*\S/))) { label = m[1].padStart(2, '0'); re = /^\s*\d{1,2}[.．、]\s*/; }
    else if ((m = t.match(/^(結語|結論|前言|後記|總結|小結)[：:]\s*\S/))) { label = m[1]; re = /^\s*(結語|結論|前言|後記|總結|小結)[：:]\s*/; }
    else if ((m = t.match(/^(Conclusion|Closing|Introduction|Afterword|Summary|Recap|Wrap-up)[：:]\s*\S/i))) { label = m[1]; re = /^\s*(Conclusion|Closing|Introduction|Afterword|Summary|Recap|Wrap-up)[：:]\s*/i; }
    else if (/^(參考資料|參考文獻|資料來源|References)$/i.test(t)) label = 'REF';
    if (re) stripPrefix(h, re);
    const ht = el('span', { className: ['ht'] }, h.children);
    h.children = label ? [el('span', { className: ['hn'], ariaHidden: 'true' }, [txt(label)]), ht] : [ht];
  }
}

function figures(root) {
  let count = 0;
  const kids = root.children;
  for (let i = 0; i < kids.length; i++) {
    const p = kids[i];
    if (!isEl(p, 'p')) continue;
    const solid = p.children.filter((c) => !isBlank(c));
    if (solid.length !== 1) continue;
    let img = solid[0];
    if (isEl(img, 'a') && img.children.filter((c) => !isBlank(c)).length === 1) img = img.children.find((c) => !isBlank(c));
    if (!isEl(img, 'img')) continue;
    count++;
    // 圖說：下一個非空白節點
    let j = i + 1;
    while (j < kids.length && isBlank(kids[j])) j++;
    const next = kids[j];
    let caption = null;
    if (isEl(next, 'p')) {
      const t = textOf(next).trim();
      const alt = String(img.properties.alt || '').replace(/[*\\]/g, '').trim();
      const solidN = next.children.filter((c) => !isBlank(c));
      const single = solidN.length === 1 && (isEl(solidN[0], 'em') || isEl(solidN[0], 'strong'));
      if (t && t.length <= 200 && ((alt && t === alt) || single || /^(圖|figure|fig\.)\s*\d+/i.test(t))) {
        caption = single ? solidN[0].children : next.children;
        kids.splice(j, 1);
      }
    }
    if (count > 1) { img.properties.loading = 'lazy'; img.properties.decoding = 'async'; }
    const fig = el('figure', { className: ['plate'] }, [
      el('button', { type: 'button', className: ['zoom'], ariaLabel: S.zoom(count) }, [img]),
    ]);
    if (caption) {
      const holder = el('span', { className: ['ct'] }, caption);
      const t = textOf(holder).trim();
      const m = t.match(/^(?:圖|Figure|Fig\.)\s*(\d+)/i);
      let label = S.fig(count);
      if (m) { label = S.fig(m[1]); stripPrefix(holder, /^\s*(?:圖|Figure|Fig\.)\s*\d+[\s　：:.]*/i); }
      fig.children.push(el('figcaption', {}, [el('span', { className: ['fn'] }, [txt(label)]), holder]));
    }
    kids[i] = fig;
  }
}

function tables(root) {
  walk(root, (n, parent) => {
    if (!isEl(n, 'table') || !parent) return;
    const head = [];
    walk(n, (c) => { if (isEl(c, 'thead')) walk(c, (th) => { if (isEl(th, 'th')) head.push(textOf(th).trim()); }); });
    walk(n, (tr) => {
      if (!isEl(tr, 'tr')) return;
      let k = 0;
      for (const td of tr.children) if (isEl(td, 'td')) { td.properties.dataLabel = head[k] || ''; k++; }
    });
    const idx = parent.children.indexOf(n);
    parent.children[idx] = el('div', { className: ['tbl'], role: 'region', tabIndex: 0, ariaLabel: S.table }, [n]);
    return false;
  });
}

function sourceLabel(href) {
  const ax = paperUrl(href)?.match(/^https:\/\/arxiv\.org\/abs\/(.+)$/);
  if (ax) return `arXiv ${ax[1]}`;
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch { return S.link; }
}

function citations(root, file) {
  const kids = root.children;
  const hi = kids.findIndex((n) => (isEl(n, 'h2') || isEl(n, 'h3')) && /^(參考資料|參考文獻|資料來源|References)$/i.test(textOf(n).trim()));
  let li = hi + 1, list = null;
  if (hi >= 0) {
    while (li < kids.length && !isEl(kids[li])) li++;
    if (isEl(kids[li], 'ul') || isEl(kids[li], 'ol')) list = kids[li];
  }
  const refs = [];
  const byUrl = new Map();
  for (const item of (list?.children ?? []).filter((c) => isEl(c, 'li'))) {
    let a = null;
    walk(item, (c) => { if (!a && isEl(c, 'a')) a = c; });
    const r = { item, href: a ? a.properties.href : null, title: a ? textOf(a).trim() : textOf(item).trim(), note: a ? textOf(item).replace(textOf(a), '').replace(/^[\s。．.，,：:]+|[\s]+$/g, '') : '' };
    refs.push(r);
    if (r.href && !byUrl.has(normUrl(r.href))) byUrl.set(normUrl(r.href), r);
  }
  // 先記下原始連結，避免走訪過程中又處理新插入的引用標記。
  const hits = [];
  for (let t = 0; t < (hi < 0 ? kids.length : hi); t++) {
    walk(kids[t], (c, parent) => {
      if (isEl(c) && /^(?:h[1-6]|pre|code|aside)$/.test(c.tagName)) return false;
      if (isEl(c, 'a') && textOf(c).trim()) hits.push({ t, a: c, parent });
    });
  }
  const generated = [];
  const inserts = []; // [topIndex, aside]
  const usedIds = new Set();
  walk(root, (n) => {
    if (n.properties?.id) usedIds.add(String(n.properties.id));
    // rehype-raw 在此外掛之後才解析手寫 HTML，也要避開其中的錨點。
    if (n.type === 'raw') for (const m of n.value.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) usedIds.add(m[1] ?? m[2] ?? m[3]);
  });
  const uniqueId = (base) => {
    let id = base, n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    return id;
  };
  for (const { t, a, parent } of hits) {
    const href = a.properties.href, key = normUrl(href);
    let r = byUrl.get(key);
    if (!r) {
      const canonical = paperUrl(href);
      if (!canonical) continue;
      const title = String(a.properties.title || textOf(a)).trim();
      const item = el('li', {}, [el('a', { href: canonical }, [txt(title)])]);
      r = { item, href: canonical, title, note: '' };
      refs.push(r); generated.push(item); byUrl.set(key, r);
    }
    if (r.cited) continue;
    r.cited = true;
    const k = refs.indexOf(r) + 1, id = uniqueId(`sn${k}`), anchorId = uniqueId(`cite${k}`);
    parent.children.splice(parent.children.indexOf(a) + 1, 0, el('sup', { className: ['ref'], id: anchorId }, [el('a', { href: `#${id}`, ariaLabel: S.note(k) }, [txt(String(k))])]));
    const name = textOf(a).trim(), strong = name.length >= 2 ? name : r.title;
    inserts.push([t, el('aside', { className: ['sn'], id, dataAnchor: anchorId }, [
      el('span', { className: ['snk'] }, [el('b', {}, [txt(String(k))]), txt(sourceLabel(r.href))]),
      el('strong', {}, [txt(strong)]),
      ...(r.title && r.title !== strong ? [el('span', { className: ['snt'] }, [txt(r.title)])] : []),
      ...(r.note ? [el('span', { className: ['snw'] }, [txt(r.note)])] : []),
      el('a', { href: r.href, target: '_blank', rel: 'noopener' }, [txt(S.open)]),
    ])]);
  }
  if (generated.length) {
    if (list) list.children.push(...generated);
    else {
      list = el('ul', {}, generated);
      if (hi >= 0) kids.splice(li, 0, list);
      else {
        const id = uniqueId('references');
        kids.push(el('h2', { id }, [txt(S.references)]), list);
        file?.data?.astro?.headings?.push({ depth: 2, slug: id, text: S.references });
      }
    }
  }
  if (list) addClass(list, 'refs');
  refs.forEach((r, i) => (r.item.properties.id ??= uniqueId(`ref${i + 1}`)));
  // 同段落的註記保持正文的順序；由後往前插入才不會影響原始索引。
  inserts.reverse();
  inserts.sort((a, b) => b[0] - a[0]).forEach(([t, aside]) => kids.splice(t + 1, 0, aside));
  if (file?.data?.astro?.frontmatter) file.data.astro.frontmatter.fieldSidenoteCount = inserts.length;
  return refs.filter((r) => r.href).length;
}

// 中文文章 id（含 Medium 時期的網址 hash）→ 英文版網址
let enSlugs = null;
function englishSlugs() {
  if (enSlugs) return enSlugs;
  enSlugs = new Map();
  const ls = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : []);
  for (const f of ls('src/content/en')) {
    const m = fs.readFileSync(path.join('src/content/en', f), 'utf8').match(/^original:\s*['"]?([^'"\n]+)/m);
    if (m) enSlugs.set(m[1].trim(), f.slice(0, -3));
  }
  // Medium 時期另外發過的英文版，連過去也導到同一篇
  for (const f of ls('src/content/blog')) {
    const m = fs.readFileSync(path.join('src/content/blog', f), 'utf8').match(/^translationOf:\s*(\S+)/m);
    if (m && enSlugs.has(m[1])) enSlugs.set(f.slice(0, -3), enSlugs.get(m[1]));
  }
  return enSlugs;
}

function englishLinks(root) {
  const map = englishSlugs();
  walk(root, (n) => {
    if (!isEl(n, 'a')) return;
    const href = String(n.properties.href || '');
    let id = null, hash = '';
    const m = href.match(/^(?:\.\.\/|\/posts\/|https?:\/\/(?:www\.)?chichieh-huang\.com\/posts\/)([^/#?]+)\/?(#.*)?$/);
    if (m) { try { id = decodeURIComponent(m[1]).toLowerCase(); } catch { id = m[1]; } hash = m[2] ?? ''; }
    else {
      const mm = href.match(/^https?:\/\/(?:[\w-]+\.)?medium\.com\/@cch\.chichieh\/[^?#]*-([0-9a-f]{12})(?:[?#].*)?$/);
      if (mm) id = mm[1];
    }
    if (id && map.has(id)) n.properties.href = `/en/writing/${map.get(id)}/${hash}`;
  });
}

function lede(root) {
  const first = root.children.find((n) => isEl(n));
  if (isEl(first, 'p') && !first.children.some((c) => isEl(c, 'img')) && textOf(first).trim().length >= 12) addClass(first, 'lede');
}

function links(root) {
  walk(root, (n) => {
    if (!isEl(n, 'a')) return;
    const href = String(n.properties.href || '');
    if (/^https?:\/\//.test(href) && !/^https?:\/\/(www\.)?chichieh-huang\.com/.test(href)) {
      n.properties.target = '_blank';
      n.properties.rel = 'noopener';
    }
  });
}

// 站內圖片（/content-images、/assets）補上寬高，避免延遲載入時版面跳動
async function imageSizes(tree) {
  let sharp;
  try { sharp = (await import('sharp')).default; } catch { return; }
  const { existsSync } = await import('node:fs');
  const jobs = [];
  walk(tree, (n) => {
    if (!isEl(n, 'img') || n.properties.width) return;
    const src = String(n.properties.src || '');
    if (!src.startsWith('/')) return;
    let file;
    try { file = 'public' + decodeURI(src.split('?')[0]); } catch { return; }
    if (!existsSync(file)) return;
    jobs.push(sharp(file).metadata().then((m) => { if (m.width && m.height) { n.properties.width = m.width; n.properties.height = m.height; } }).catch(() => {}));
  });
  await Promise.all(jobs);
}

export default function rehypeField() {
  return async (tree, file) => {
    await imageSizes(tree);
    // 在 await 之後才設定語言：之後都是同步的，不會被同時處理的其他文章蓋掉
    const fm = file?.data?.astro?.frontmatter ?? {};
    S = fm.original || /[\\/]content[\\/]en[\\/]/.test(String(file?.path ?? '')) ? STR.en : STR.zh;
    // 只在最外層整理，避免動到清單、引言裡的結構
    tree.children = tree.children.filter((n) => n.type !== 'comment');
    if (S === STR.en) englishLinks(tree);
    figures(tree);
    tables(tree);
    const referenceCount = citations(tree, file);
    if (file?.data?.astro?.frontmatter) file.data.astro.frontmatter.fieldReferenceCount = referenceCount;
    headings(tree);
    lede(tree);
    links(tree);
  };
}
