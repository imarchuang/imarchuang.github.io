import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/generated/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    legacyPath: z.string(),
    createdDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    updatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    language: z.enum(["en", "zh-CN"]),
    navOrder: z.number().optional(),
  }),
});

export const collections = { notes };
