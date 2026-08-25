import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/generated/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(""),
    legacyPath: z.string(),
    language: z.enum(["en", "zh-CN"]),
    navOrder: z.number().optional(),
  }),
});

export const collections = { notes };
