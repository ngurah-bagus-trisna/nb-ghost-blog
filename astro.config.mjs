import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://twnb.nbtrisna.my.id',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        if (item.url === 'https://twnb.nbtrisna.my.id/') {
          return { ...item, changefreq: 'daily', priority: 1.0 };
        }
        if (item.url.includes('/tag/') || item.url.includes('/author/') || item.url === 'https://twnb.nbtrisna.my.id/about/') {
          return { ...item, changefreq: 'weekly', priority: 0.5 };
        }
        return { ...item, changefreq: 'monthly', priority: 0.8 };
      },
    }),
  ],
  markdown: {
    syntaxHighlight: false,
  },
});
