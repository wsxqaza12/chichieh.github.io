import rss from '@astrojs/rss';
import { getAllPosts, postUrl } from '../lib/posts';

export async function GET(context) {
  const posts = (await getAllPosts()).filter((p) => !p.data.draft).slice(0, 20);
  return rss({
    title: 'ChiChieh Huang',
    description: '專注於 Generative AI 產品開發，用中文把 AI 寫得更清楚。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description ?? '',
      link: postUrl(post),
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: '<language>zh-Hant</language>',
  });
}
