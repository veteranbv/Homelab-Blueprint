import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const chapters = defineCollection({
  loader: glob({ pattern: '[0-9][0-9]-*.md', base: './docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().int().min(1).max(99),
    phase: z.string(),
    decision: z.string(),
    deliverable: z.string(),
    gate: z.string(),
  }),
})

export const collections = { chapters }
