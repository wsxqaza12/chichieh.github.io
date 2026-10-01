import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeField from './src/lib/rehype-field.mjs';

export default defineConfig({
  site: 'https://chichieh-huang.com',
  integrations: [sitemap()],
  markdown: {
    // 先產生標題 id（目錄用），再做文章排版
    rehypePlugins: [rehypeHeadingIds, rehypeField],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
