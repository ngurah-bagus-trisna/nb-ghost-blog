import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    updated: z.date().optional(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('I Gusti Ngurah Bagus Trisna Andika'),
    authorSlug: z.string().default('ngurah'),
    featuredImage: z.string().optional(),
    slug: z.string(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    published: z.date().optional(),
  }),
});

export const collections = {
  posts: postsCollection,
  pages: pagesCollection,
};
