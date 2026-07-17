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

export const collections = { blog, synced };
