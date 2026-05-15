import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

function buildDateMap() {
  const postsDir = join(process.cwd(), 'src/content/posts');
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const map = new Map();
  for (const file of files) {
    const content = readFileSync(join(postsDir, file), 'utf-8');
    const slugMatch = content.match(/^slug:\s*["']?([^"'\n]+)/m);
    const updatedMatch = content.match(/^updated:\s*(.+)/m);
    const publishedMatch = content.match(/^published:\s*(.+)/m);
    const dateStr = updatedMatch?.[1]?.trim() || publishedMatch?.[1]?.trim();
    const slug = slugMatch?.[1]?.trim()?.replace(/["']/g, '') || basename(file, '.md');
    if (dateStr) map.set(slug, new Date(dateStr).toISOString());
  }
  return map;
}

const dateMap = buildDateMap();

export default defineConfig({
  site: 'https://twnb.nbtrisna.my.id',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        const url = item.url;
        const siteUrl = 'https://twnb.nbtrisna.my.id';
        const lastmod = new Date().toISOString();

        if (url === `${siteUrl}/`) {
          return { ...item, changefreq: 'daily', priority: 1.0, lastmod };
        }
        if (url.includes('/tag/') || url.includes('/author/') || url === `${siteUrl}/about/`) {
          return { ...item, changefreq: 'weekly', priority: 0.5, lastmod };
        }

        // Post pages — use frontmatter date
        const slug = url.replace(siteUrl, '').replace(/\/$/, '').split('/').pop();
        const postDate = slug ? dateMap.get(slug) : undefined;
        return { ...item, changefreq: 'monthly', priority: 0.8, lastmod: postDate || lastmod };
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
      langs: [
        'sh', 'bash', 'shell', 'json', 'yaml', 'javascript', 'typescript',
        'python', 'dockerfile', 'go', 'hcl', 'c', 'sql', 'nginx', 'xml', 'toml', 'ini',
      ],
      langAlias: {
        cfg: 'ini',
        cnf: 'ini',
        conf: 'ini',
        fonfig: 'ini',
        shellsession: 'sh',
        tf: 'hcl',
        tfvars: 'hcl',
        vim: 'ini',
        terraform: 'hcl',
      },
    },
  },
});
