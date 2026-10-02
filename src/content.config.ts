import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string().optional(),
  category: z.string().default('技術'),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  hero: z.string().optional(),
  source: z.string().optional(),
  /** 地形圖上的區域（資料工程、LLM、RAG、語音・Avatar、Vibe Coding、Agent、龍蝦、MCP、記憶），不填就自動判斷 */
  region: z.string().optional(),
  /** 這篇本身是另一篇中文文章的英文版（Medium 時期的英文翻譯）：英文網站改用 src/content/en/ 的版本，不重複列出 */
  translationOf: z.string().optional(),
});

// 已遷移的 Medium 文章（存在 repo 裡，slug = medium hash，維持舊站 /posts/<hash>/ 網址）
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: postSchema,
});

// 從 content-dna 同步進來的文章（gitignored，由 scripts/sync-content.mjs 產生）
const synced = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/synced' }),
  schema: postSchema,
});

// 英文版文章：檔名 = 英文網址（/en/writing/<檔名>/），original 指向中文文章的 id。
// sourceHash 是翻譯當下中文原文的指紋，原文之後改過的話，建置時會提醒要更新翻譯。
const en = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/en' }),
  schema: z.object({
    original: z.string(),
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sourceHash: z.string(),
  }),
});

export const collections = { blog, synced, en };
