import { getCollection, type CollectionEntry } from 'astro:content';
import { createHash } from 'node:crypto';
import { regionOf } from './regions';
import { seriesOf } from '../data/series';

export type Post = CollectionEntry<'blog'> | CollectionEntry<'synced'>;
export type EnPost = CollectionEntry<'en'>;

// 中文文章 id → 英文版（src/content/en/）。getAllPosts() 每次都會重新整理。
const EN = new Map<string, EnPost>();

/** 合併兩個文章來源，依日期新到舊排序。production 會過濾草稿。 */
export async function getAllPosts(): Promise<Post[]> {
  const [blog, synced, en] = await Promise.all([getCollection('blog'), getCollection('synced'), getCollection('en')]);
  EN.clear();
  for (const e of en) EN.set(e.data.original, e);
  const posts = [...blog, ...synced].filter((p) => import.meta.env.DEV || !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

/** 有英文版的文章（英文網站只列這些） */
export async function getEnglishPosts(): Promise<Post[]> {
  return (await getAllPosts()).filter((p) => EN.has(p.id));
}

/** 文章的英文版（要先呼叫過 getAllPosts） */
export const englishOf = (post: Post): EnPost | undefined => EN.get(post.id);

/** 依網站語言給文章網址；英文版還沒翻譯的文章回到中文頁 */
export function postUrl(post: Post, lang: 'zh' | 'en' = 'zh'): string {
  const e = lang === 'en' ? EN.get(post.id) : undefined;
  return e ? `/en/writing/${e.id}/` : `/posts/${post.id}/`;
}

/** 中文原文的指紋：翻譯檔記下這個值，原文之後改過就對不上 */
export const sourceHash = (post: Post) => createHash('sha1').update((post.body ?? '').trim()).digest('hex').slice(0, 12);

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

/** 英文的字數（words） */
export function wordCount(body: string): number {
  return (plain(body).match(/[A-Za-z0-9][A-Za-z0-9'’.-]*/g) ?? []).length;
}

/** 依網站語言的篇幅：中文版是字數，英文版是英文翻譯的 words */
export function lengthOf(post: Post, lang: 'zh' | 'en' = 'zh'): number {
  const e = lang === 'en' ? EN.get(post.id) : undefined;
  return e ? wordCount(e.body ?? '') : charCount(post.body ?? '');
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

/** 文章是用什麼語言寫的（英文文章的中文字很少） */
export function postLang(post: Post): 'zh' | 'en' {
  const text = plain(post.body ?? '');
  const cjk = (text.match(CJK) ?? []).length;
  const words = (text.replace(CJK, ' ').match(/[A-Za-z]+/g) ?? []).length;
  return cjk < (cjk + words) * 0.15 ? 'en' : 'zh';
}

/** 依網站語言取標題：英文版用翻譯的標題，沒有翻譯就用原標題 */
export function titleIn(post: Post, lang: 'zh' | 'en'): string {
  if (lang === 'zh') return displayTitle(post);
  return EN.get(post.id)?.data.title ?? displayTitle(post);
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
  // 英文版（有翻譯才有）：標題、摘要、網址、words
  te?: string;
  xe?: string;
  es?: string;
  ne?: number;
  lang: 'zh' | 'en'; // 文章本身的語言
  season?: number;
  ep?: number;
}

export function summarize(post: Post): PostSummary {
  const s = seriesOf(post.id);
  const e = EN.get(post.id);
  return {
    id: post.id,
    t: displayTitle(post),
    d: post.data.date.toISOString().slice(0, 10),
    n: charCount(post.body ?? ''),
    topic: regionOfPost(post),
    x: post.data.description ?? '',
    ...(e ? { te: e.data.title, xe: e.data.description ?? '', es: e.id, ne: wordCount(e.body ?? '') } : {}),
    lang: postLang(post),
    ...(s ? { season: s.season.n, ep: s.ep } : {}),
  };
}

let cache: PostSummary[] | null = null;
export async function getSummaries(): Promise<PostSummary[]> {
  if (!cache) cache = (await getAllPosts()).map(summarize);
  return cache;
}
