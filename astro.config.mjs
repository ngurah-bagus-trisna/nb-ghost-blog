import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://twnb.nbtrisna.my.id',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: false,
  },
});
