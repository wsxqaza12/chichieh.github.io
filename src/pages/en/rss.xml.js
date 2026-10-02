import rss from '@astrojs/rss';
import { getEnglishPosts, postUrl, titleIn, englishOf } from '../../lib/posts';

export async function GET(context) {
  const posts = (await getEnglishPosts()).filter((p) => !p.data.draft).slice(0, 20);
  return rss({
    title: 'ChiChieh Huang',
    description: 'Essays on generative AI, AI agents and agent memory, translated from Traditional Chinese.',
    site: context.site,
    items: posts.map((post) => ({
      title: titleIn(post, 'en'),
      pubDate: post.data.date,
      description: englishOf(post)?.data.description ?? '',
      link: postUrl(post, 'en'),
      categories: englishOf(post)?.data.tags ?? [],
    })),
    customData: '<language>en</language>',
  });
}
