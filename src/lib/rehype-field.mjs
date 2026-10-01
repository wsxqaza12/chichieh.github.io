// 文章內文的「野外紀錄」排版，在建置時改寫 HTML（hast），所有文章共用：
// - h2：「1. 標題」→ 編號標籤 + 標題；「結語：…」、「參考資料」也有標籤
// - 單獨一行的圖片 → 圖版（可放大），後面那行圖說（*圖 1　…* 或與 alt 相同的粗體）變成 figcaption
// - 表格包一層可橫向捲動的容器，每格補上欄名（手機版改成卡片時用）
// - 文末「參考資料」清單 → 內文第一次引用處加上 [n]，並在段落後放一張引用註記
// - 第一段文字 → 引言（lede）；站外連結開新分頁
// 必須排在 rehypeHeadingIds 之後，這樣標題 id 與目錄不受影響。

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

const normUrl = (u) => String(u || '').replace(/#.*$/, '').replace(/\/+$/, '');

function headings(root) {
  for (const h of root.children) {
    if (!isEl(h, 'h2')) continue;
    const t = textOf(h).trim();
    let label = null, re = null;
    let m;
    if ((m = t.match(/^(\d{1,2})[.．、]\s*\S/))) { label = m[1].padStart(2, '0'); re = /^\s*\d{1,2}[.．、]\s*/; }
    else if ((m = t.match(/^(結語|結論|前言|後記|總結|小結)[：:]\s*\S/))) { label = m[1]; re = /^\s*(結語|結論|前言|後記|總結|小結)[：:]\s*/; }
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
      el('button', { type: 'button', className: ['zoom'], ariaLabel: `放大圖 ${count}` }, [img]),
    ]);
    if (caption) {
      const holder = el('span', { className: ['ct'] }, caption);
      const t = textOf(holder).trim();
      const m = t.match(/^(圖\s*\d+)/);
      let label = `圖 ${count}`;
      if (m) { label = m[1].replace(/\s+/g, ' ').replace(/圖(\d)/, '圖 $1'); stripPrefix(holder, /^\s*圖\s*\d+[\s　：:]*/); }
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
    parent.children[idx] = el('div', { className: ['tbl'], role: 'region', tabIndex: 0, ariaLabel: '表格' }, [n]);
    return false;
  });
}

function sourceLabel(href) {
  const ax = String(href).match(/arxiv\.org\/(?:abs|html|pdf)\/(\d{4}\.\d{4,5})/);
  if (ax) return `arXiv ${ax[1]}`;
  try { return new URL(href).hostname.replace(/^www\./, ''); } catch { return '連結'; }
}

function citations(root) {
  const kids = root.children;
  const hi = kids.findIndex((n) => isEl(n, 'h2') && /^(REF)?(參考資料|參考文獻|資料來源|References)$/i.test(textOf(n).trim()));
  if (hi < 0) return;
  let li = hi + 1;
  while (li < kids.length && !isEl(kids[li])) li++;
  const list = kids[li];
  if (!isEl(list, 'ul') && !isEl(list, 'ol')) return;
  addClass(list, 'refs');
  const refs = [];
  for (const item of list.children.filter((c) => isEl(c, 'li'))) {
    let a = null;
    walk(item, (c) => { if (!a && isEl(c, 'a')) a = c; });
    refs.push({ item, href: a ? a.properties.href : null, title: a ? textOf(a).trim() : textOf(item).trim(), note: a ? textOf(item).replace(textOf(a), '').replace(/^[\s。．.，,：:]+|[\s]+$/g, '') : '' });
  }
  refs.forEach((r, i) => (r.item.properties.id = `ref${i + 1}`));
  const inserts = []; // [topIndex, aside]
  refs.forEach((r, i) => {
    if (!r.href) return;
    const k = i + 1;
    for (let t = 0; t < hi; t++) {
      let hit = null, hitParent = null;
      walk(kids[t], (c, parent) => {
        if (hit || isEl(c, 'figcaption')) return false;
        if (isEl(c, 'a') && normUrl(c.properties.href) === normUrl(r.href)) { hit = c; hitParent = parent; return false; }
      });
      if (!hit) continue;
      const pos = hitParent.children.indexOf(hit);
      hitParent.children.splice(pos + 1, 0, el('sup', { className: ['ref'] }, [el('a', { href: `#sn${k}`, ariaLabel: `註 ${k}` }, [txt(String(k))])]));
      const name = textOf(hit).trim();
      const strong = name.length >= 2 ? name : r.title;
      const aside = el('aside', { className: ['sn'], id: `sn${k}` }, [
        el('span', { className: ['snk'] }, [el('b', {}, [txt(String(k))]), txt(sourceLabel(r.href))]),
        el('strong', {}, [txt(strong)]),
        ...(r.title && r.title !== strong ? [el('span', { className: ['snt'] }, [txt(r.title)])] : []),
        ...(r.note ? [el('span', { className: ['snw'] }, [txt(r.note)])] : []),
        el('a', { href: r.href, target: '_blank', rel: 'noopener' }, [txt('開啟原文 ↗')]),
      ]);
      inserts.push([t, aside]);
      return;
    }
  });
  // 由後往前插，索引才不會亂
  inserts.sort((a, b) => b[0] - a[0]).forEach(([t, aside]) => kids.splice(t + 1, 0, aside));
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
  return async (tree) => {
    await imageSizes(tree);
    // 只在最外層整理，避免動到清單、引言裡的結構
    tree.children = tree.children.filter((n) => n.type !== 'comment');
    headings(tree);
    figures(tree);
    tables(tree);
    citations(tree);
    lede(tree);
    links(tree);
  };
}
