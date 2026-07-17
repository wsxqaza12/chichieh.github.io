import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'> | CollectionEntry<'synced'>;

/** 合併兩個文章來源，依日期新到舊排序。production 會過濾草稿。 */
export async function getAllPosts(): Promise<Post[]> {
  const [blog, synced] = await Promise.all([getCollection('blog'), getCollection('synced')]);
  const posts = [...blog, ...synced].filter((p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

export function formatMonth(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/** 中文為主的閱讀時間估算：CJK 字數 / 350 + 英文單字 / 200，至少 1 分鐘 */
export function readingTime(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) ?? []).length;
  const words = (text.replace(/[一-鿿㐀-䶿]/g, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}
