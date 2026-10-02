import fs from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeField from './src/lib/rehype-field.mjs';

// Cloudflare Pages 找的是最近一層的 404.html；Astro 會把 en/404.astro 輸出成 en/404/index.html，這裡搬過去
const nestedNotFound = {
  name: 'nested-404',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const from = new URL('en/404/index.html', dir), to = new URL('en/404.html', dir);
      if (fs.existsSync(from)) { fs.renameSync(from, to); fs.rmdirSync(new URL('en/404/', dir)); }
    },
  },
};

export default defineConfig({
  site: 'https://chichieh-huang.com',
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) }), nestedNotFound],
  markdown: {
    // 先產生標題 id（目錄用），再做文章排版
    rehypePlugins: [rehypeHeadingIds, rehypeField],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
