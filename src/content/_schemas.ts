import * as z from "astro/zod";
import type { SchemaContext } from "astro:content";

/**
 * Builds the post schema around the validator used for `ogImage`. The
 * collection passes Astro's image(), which resolves the path and fails the
 * build if the file is missing. Tests run outside Astro, so they pass a plain
 * string schema to read the raw path instead.
 */
export const createBlogSchema = <T extends z.ZodType>(ogImage: T) =>
  z
    .object({
      author: z.string().optional(),
      pubDatetime: z.date(),
      title: z.string(),
      postSlug: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: ogImage.optional(),
      description: z.string(),
    })
    .strict();

export const blogSchema = ({ image }: SchemaContext) =>
  createBlogSchema(image());

export type BlogFrontmatter = z.infer<ReturnType<typeof blogSchema>>;
