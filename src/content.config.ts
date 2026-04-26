import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    period: z.string(),
    domain: z.enum(['ml', 'finance', 'cv', 'data', 'web']).default('ml'),
    domainLabel: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    github: z.url().optional(),
    demo: z.url().optional(),
  }),
});

export const collections = { blog, projects };
