import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  const sorted = posts
    .filter(p => p.data.published)
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

  return rss({
    title: 'twnb — Tech with Ngurah Bagus',
    description: 'IT notes, tutorials, and personal journey. Linux, KVM, AWS, Kubernetes, and DevOps guides.',
    site: context.site?.href || 'https://twnb.nbtrisna.my.id',
    image: 'https://twnb.nbtrisna.my.id/content/images/2024/08/logo-Primary-1.png',
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.excerpt || '',
      link: `/${post.data.slug}/`,
      pubDate: post.data.published,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: `<language>id</language>
    <copyright>© ${new Date().getFullYear()} I Gusti Ngurah Bagus Trisna Andika</copyright>
    <managingEditor>${sorted[0]?.data.author || 'I Gusti Ngurah Bagus Trisna Andika'}</managingEditor>
    <webMaster>${sorted[0]?.data.author || 'I Gusti Ngurah Bagus Trisna Andika'}</webMaster>`,
  });
}
