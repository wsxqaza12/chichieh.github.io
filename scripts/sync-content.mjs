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

const contentDir =
  process.env.CONTENT_DIR ?? config.contentDirCandidates.find((d) => fs.existsSync(d));

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.md')) fs.unlinkSync(path.join(OUT, f));
}

if (!contentDir) {
  console.warn('sync: content repo not found — building with migrated posts only.');
  process.exit(0);
}

// 一次掃過 git 歷史，建出「檔案 → 首次 commit 時間」的映射（比逐檔 git log 快得多）
const firstCommitDate = new Map();
try {
  const log = execFileSync(
    'git',
    ['log', '--diff-filter=A', '--name-only', '--format=@%aI', '--reverse'],
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

let count = 0;
const seen = new Set();

for (const source of config.sources) {
  const dir = path.join(contentDir, source.dir);
  if (!fs.existsSync(dir)) continue;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    if (config.excludeFiles.includes(file)) continue;
    if (config.excludePatterns.some((p) => file.includes(p))) continue;

    const fullPath = path.join(dir, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = matter(raw);

    let { title, body } = extractTitle(parsed.content.trim(), file.replace(/\.md$/, '').trim());
    const tagResult = extractTags(body);
    body = tagResult.body;
    if (!body) continue;

    const relPath = path.join(source.dir, file);
    const date =
      parsed.data.date ??
      firstCommitDate.get(relPath) ??
      fs.statSync(fullPath).mtime.toISOString();

    let slug = slugify(file);
    if (seen.has(slug)) slug = `${slug}-2`;
    seen.add(slug);

    const fm = {
      title: parsed.data.title ?? title,
      date: new Date(date),
      description: parsed.data.description ?? makeDescription(body),
      category: parsed.data.category ?? source.category,
      tags: parsed.data.tags ?? tagResult.tags,
      draft: parsed.data.draft ?? source.draft ?? false,
      source: 'content-dna',
    };

    fs.writeFileSync(path.join(OUT, `${slug}.md`), matter.stringify(body, fm));
    count++;
  }
}

console.log(`synced ${count} posts from ${contentDir} → ${OUT}/`);
