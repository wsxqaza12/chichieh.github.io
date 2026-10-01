import { getCollection, type CollectionEntry } from 'astro:content';
import { regionOf } from './regions';
import { seriesOf } from '../data/series';

export type Post = CollectionEntry<'blog'> | CollectionEntry<'synced'>;

/** 合併兩個文章來源，依日期新到舊排序。production 會過濾草稿。 */
export async function getAllPosts(): Promise<Post[]> {
  const [blog, synced] = await Promise.all([getCollection('blog'), getCollection('synced')]);
  const posts = [...blog, ...synced].filter((p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
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

/** 2026.09.22 */
export const dotDate = (d: Date) => formatDate(d).replaceAll('/', '.');

const CJK = /[一-鿿㐀-䶿]/g;
function plain(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

/** 中文為主的閱讀時間估算：CJK 字數 / 350 + 英文單字 / 200，至少 1 分鐘 */
export function readingTime(body: string): number {
  const text = plain(body);
  const cjk = (text.match(CJK) ?? []).length;
  const words = (text.replace(CJK, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 350 + words / 200));
}

/** 字數：CJK 字 + 英文單字 */
export function charCount(body: string): number {
  const text = plain(body);
  return (text.match(CJK) ?? []).length + (text.replace(CJK, ' ').match(/[A-Za-z0-9]+/g) ?? []).length;
}

/** 網站上顯示的標題：連載文章拿掉開頭的編號；英文撇號換成直的（中文字型的 ’ 是全形，Don’t 會被撐開） */
export function displayTitle(post: Post): string {
  const t = post.data.title.replace(/(?<=[A-Za-z])’(?=[A-Za-z])/g, "'");
  return seriesOf(post.id) ? t.replace(/^\d+\s+/, '') : t;
}

export function regionOfPost(post: Post): string {
  return regionOf(post.id, post.data.title, (post.data as { region?: string }).region);
}

/** 地圖與文章列表共用的精簡資料（順序 = 日期新到舊，地圖的隨機位移也依這個順序） */
export interface PostSummary {
  id: string;
  t: string;
  d: string; // YYYY-MM-DD
  n: number; // 字數
  topic: string; // 區域
  x: string; // 摘要
  season?: number;
  ep?: number;
}

export function summarize(post: Post): PostSummary {
  const s = seriesOf(post.id);
  return {
    id: post.id,
    t: displayTitle(post),
    d: post.data.date.toISOString().slice(0, 10),
    n: charCount(post.body ?? ''),
    topic: regionOfPost(post),
    x: post.data.description ?? '',
    ...(s ? { season: s.season.n, ep: s.ep } : {}),
  };
}

let cache: PostSummary[] | null = null;
export async function getSummaries(): Promise<PostSummary[]> {
  if (!cache) cache = (await getAllPosts()).map(summarize);
  return cache;
}
