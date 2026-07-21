// 從 content-dna（my_content_style）同步文章 → src/content/synced/
// 設計原則：文章庫是 source of truth，檔案不需要 frontmatter，
// 這裡自動補上（title 取第一個標題、date 取 git 首次 commit、分類取資料夾）。
// 排除規則寫在 sync.config.json，要下架/上架文章改那個檔就好。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

const config = JSON.parse(fs.readFileSync('sync.config.json', 'utf8'));
const OUT = 'src/content/synced';
const IMG_OUT = 'public/content-images';

const contentDir =
  process.env.CONTENT_DIR ?? config.contentDirCandidates.find((d) => fs.existsSync(d));

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.md')) fs.unlinkSync(path.join(OUT, f));
}
fs.rmSync(IMG_OUT, { recursive: true, force: true });

if (!contentDir) {
  console.warn('sync: content repo not found — building with migrated posts only.');
  process.exit(0);
}

// 一次掃過 git 歷史，建出「檔案 → 首次 commit 時間」的映射（比逐檔 git log 快得多）
const firstCommitDate = new Map();
try {
  // core.quotepath=false：不設的話中文路徑會輸出成 "\345..." 跳脫字串，比對永遠失敗（CI 的預設值）
  const log = execFileSync(
    'git',
    ['-c', 'core.quotepath=false', 'log', '--diff-filter=A', '--name-only', '--format=@%aI', '--reverse'],
    { cwd: contentDir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  let current = null;
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) current = line.slice(1);
    else if (line.trim() && current && !firstCommitDate.has(line.trim())) {
      firstCommitDate.set(line.trim(), current);
    }
  }
} catch {
  console.warn('sync: git history unavailable, falling back to file mtime.');
}

const EMOJI_EDGE = /^[\p{Extended_Pictographic}\s#*]+|[\p{Extended_Pictographic}\s]+$/gu;

function extractTitle(body, fallback) {
  const lines = body.split('\n');
  const idx = lines.findIndex((l) => l.trim() !== '');
  if (idx === -1) return { title: fallback, body };
  const line = lines[idx].trim();

  // # 標題
  const heading = line.match(/^#{1,4}\s+(.+)$/);
  if (heading) {
    lines.splice(idx, 1);
    return { title: heading[1].replace(EMOJI_EDGE, '').trim() || fallback, body: lines.join('\n').trim() };
  }
  // 【標題】接內文
  const bracket = line.match(/^【([^】]+)】\s*(.*)$/);
  if (bracket) {
    lines[idx] = bracket[2];
    return { title: bracket[1].trim(), body: lines.join('\n').trim() };
  }
  // #hashtag式標題（#標題 內文...）
  const hash = line.match(/^#(\S+)\s*(.*)$/);
  if (hash) {
    lines[idx] = hash[2];
    return { title: hash[1].trim(), body: lines.join('\n').trim() };
  }
  return { title: fallback, body };
}

function extractTags(body) {
  const lines = body.trimEnd().split('\n');
  const last = lines[lines.length - 1]?.trim() ?? '';
  if (/^(#[^\s#]+\s*)+$/.test(last)) {
    lines.pop();
    const tags = [...last.matchAll(/#([^\s#]+)/g)].map((m) => m[1]);
    return { tags, body: lines.join('\n').trim() };
  }
  return { tags: [], body };
}

// FB 式寫作常用「整行粗體」當章節標記，轉成 h2 才能進目錄。
// 只轉短的標題行（2–30 字、結尾不是句讀），整句強調的粗體不動。
function boldLinesToHeadings(body) {
  return body.replace(/^\*\*([^*\n]+)\*\*\s*$/gm, (match, inner) => {
    const text = inner.trim();
    if (text.length < 2 || text.length > 40) return match;
    if (/[。，、；,]$/.test(text)) return match;
    return `## ${text}`;
  });
}

function makeDescription(body) {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*>`【】]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 90) + (text.length > 90 ? '…' : '');
}

function slugify(name) {
  return name
    .replace(/\.md$/, '')
    .replace(/[。，！？：（）()\[\]|]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// 文章裡的相對路徑圖片（如 ![](images/foo.png)）：
// 把實際存在的檔案複製到 public/content-images/，並改寫 markdown 裡的路徑。
// 網址（https://…）與絕對路徑（/assets/…）不動。
let imageCount = 0;
function localizeImages(body, sourceDir) {
  return body.replace(
    /(!\[[^\]]*\]\()([^)]+)(\))/g,
    (match, open, rawUrl, close) => {
      // 容許檔名帶空格；去掉 <> 包裹與結尾的 "title"
      const url = rawUrl.trim().replace(/^<|>$/g, '').replace(/\s+"[^"]*"$/, '').trim();
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')) return match;
      // 先找文章旁邊；找不到就回頭找草稿區（文章從 raw/想寫的文章 搬出來時，圖片常留在原地）
      const bases = [sourceDir, ...(config.imageFallbackDirs ?? [])];
      const relPath = bases
        .map((base) => path.posix.normalize(path.posix.join(base, decodeURI(url))))
        .find((p) => fs.existsSync(path.join(contentDir, p)));
      if (!relPath) {
        console.warn(`sync: image not found, left as-is: ${path.posix.join(sourceDir, decodeURI(url))}`);
        return match;
      }
      const srcFile = path.join(contentDir, relPath);
      const destFile = path.join(IMG_OUT, relPath);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(srcFile, destFile);
      imageCount++;
      return `${open}/content-images/${relPath.split('/').map(encodeURIComponent).join('/')}${close}`;
    }
  );
}

let count = 0;
const seen = new Set();
const dateReport = []; // --emit-dates 用：列出每篇（非草稿）的生效日期，方便回填 dateOverrides

for (const source of config.sources) {
  const dir = path.join(contentDir, source.dir);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    // includeFiles = 白名單制（如 活動 資料夾只收精選）；沒設就全收再走排除規則
    if (source.includeFiles && !source.includeFiles.includes(file)) continue;
    if (config.excludeFiles.includes(file)) continue;
    if (config.excludePatterns.some((p) => file.includes(p))) continue;

    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);

    let { title, body } = extractTitle(parsed.content.trim(), file.replace(/\.md$/, '').trim());
    const tagResult = extractTags(body);
    body = localizeImages(boldLinesToHeadings(tagResult.body), source.dir);
    if (!body) continue;

    const relPath = path.join(source.dir, file);
    // 優先序：文內 frontmatter > 網站側 dateOverrides > git 首次 commit > 檔案 mtime
    const date =
      parsed.data.date ??
      config.dateOverrides?.[file] ??
      firstCommitDate.get(relPath) ??
      fs.statSync(fullPath).mtime.toISOString();

    let slug = slugify(file);
    if (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);

    // 文章的第一張圖自動當封面（首頁小卡、OG image 用）
    const firstImage = body.match(/!\[[^\]]*\]\(([^)]+?)(?:\s+"[^"]*")?\)/)?.[1]?.trim();

    const fm = {
      // 優先序：文內手寫 frontmatter > 網站側 titleOverrides > 自動抽取
      title: parsed.data.title ?? config.titleOverrides?.[file] ?? title,
      date: new Date(date),
      description: parsed.data.description ?? makeDescription(body),
      category: parsed.data.category ?? source.category,
      tags: parsed.data.tags ?? tagResult.tags,
      draft: parsed.data.draft ?? source.draft ?? false,
      source: 'content-dna',
      ...(parsed.data.hero ?? firstImage ? { hero: parsed.data.hero ?? firstImage } : {}),
    };

    fs.writeFileSync(path.join(OUT, `${slug}.md`), matter.stringify(body, fm));
    if (!fm.draft) dateReport.push([file, new Date(date).toISOString().slice(0, 10)]);
    count++;
  }
}

if (process.argv.includes('--emit-dates')) {
  dateReport.sort((a, b) => a[1].localeCompare(b[1]));
  console.log(JSON.stringify(Object.fromEntries(dateReport), null, 2));
}

console.log(`synced ${count} posts (${imageCount} images) from ${contentDir} → ${OUT}/`);
