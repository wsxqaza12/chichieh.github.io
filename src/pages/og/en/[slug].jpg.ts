// 英文版文章的分享卡片：/og/en/<英文網址>.jpg
import type { APIRoute } from 'astro';
import { getEnglishPosts, englishOf, titleIn, dotDate, lengthOf, readingTime, type Post } from '../../../lib/posts';
import { postCard } from '../../../lib/og';

export async function getStaticPaths() {
  return (await getEnglishPosts()).map((post) => ({ params: { slug: englishOf(post)!.id }, props: { post } }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = (props as { post: Post }).post;
  const jpg = await postCard(post.id, {
    title: titleIn(post, 'en'),
    date: dotDate(post.data.date),
    chars: lengthOf(post, 'en'),
    minutes: readingTime(englishOf(post)!.body ?? ''),
  }, 'en');
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
