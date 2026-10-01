// 每篇文章的分享卡片：/og/<slug>.jpg
import type { APIRoute } from 'astro';
import { getAllPosts, displayTitle, dotDate, charCount, readingTime, type Post } from '../../lib/posts';
import { postCard } from '../../lib/og';

export async function getStaticPaths() {
  return (await getAllPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = (props as { post: Post }).post;
  const body = post.body ?? '';
  const jpg = await postCard(post.id, {
    title: displayTitle(post),
    date: dotDate(post.data.date),
    chars: charCount(body),
    minutes: readingTime(body),
  });
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
