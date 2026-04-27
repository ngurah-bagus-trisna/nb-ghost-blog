import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sorted = posts
    .filter(p => p.data.published)
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  return rss({
    title: 'twnb',
    description: 'Tech with Ngurah Bagus',
    site: context.site?.href || 'https://twnb.nbtrisna.my.id',
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.excerpt || '',
      link: `/${post.data.slug}/`,
      pubDate: post.data.published,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: '<language>id</language>',
  });
}
