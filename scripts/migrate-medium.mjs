// 一次性遷移：_posts/zmediumtomarkdown/*.md (Jekyll/Chirpy) → src/content/blog/<hash>.md (Astro)
// 保留 medium hash 作為 slug，維持舊站 /posts/<hash>/ 網址不變。
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const SRC = process.argv[2] ?? '_posts/zmediumtomarkdown';
const OUT = 'src/content/blog';

fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md'));
let count = 0;

for (const file of files) {
  const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const { data, content } = matter(raw);

  let body = content
    .replace(/\{:target="_blank"\}/g, '') // kramdown IAL，Astro 不支援
    .replace(/^\{:[^}]*\}\s*$/gm, '')
    .trim();

  // zmediumtomarkdown 會把標題重複放在第一行的 heading，去掉
  const firstLine = body.split('\n', 1)[0];
  if (/^#{1,4}\s/.test(firstLine)) {
    const headingText = firstLine.replace(/^#+\s*/, '').replace(/\s+/g, '');
    const titleText = String(data.title ?? '').replace(/\s+/g, '');
    if (headingText && titleText.includes(headingText.slice(0, 8))) {
      body = body.slice(firstLine.length).trim();
    }
  }

  const tags = [
    ...new Set(
      [...(data.tags ?? []), ...(data.categories ?? [])].filter((t) => t && t.trim() !== '')
    ),
  ];

  const fm = {
    title: data.title,
    date: new Date(data.date),
    description: data.description ?? undefined,
    category: '技術',
    tags,
    source: 'medium',
    ...(data.image?.path ? { hero: data.image.path } : {}),
  };

  fs.writeFileSync(path.join(OUT, `${slug}.md`), matter.stringify(body, fm));
  count++;
}

console.log(`migrated ${count} medium posts → ${OUT}/`);
