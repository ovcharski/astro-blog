import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import * as z from "astro/zod";
import { createBlogSchema } from "@content/_schemas";

export const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

// image() only exists inside Astro, so ogImage stays the path as written
const rawBlogSchema = createBlogSchema(z.string());

export type RealPost = {
  // Path relative to BLOG_DIR, with forward slashes
  file: string;
  data: z.infer<typeof rawBlogSchema>;
  body: string;
};

/**
 * Reads the real posts from disk, so tests can check the published content
 * rather than fixtures. Mirrors the glob loader in content.config.ts: `.md`
 * files at any depth whose name does not start with `_`.
 */
export const loadRealPosts = (): RealPost[] =>
  readdirSync(BLOG_DIR, { recursive: true, encoding: "utf8" })
    .map(file => file.split(path.sep).join("/"))
    .filter(file => {
      const name = path.posix.basename(file);
      return name.endsWith(".md") && !name.startsWith("_");
    })
    .map(file => {
      const source = readFileSync(path.join(BLOG_DIR, file), "utf8");
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!match) throw new Error(`${file} has no frontmatter`);
      return {
        file,
        // Astro's loader reads unquoted timestamps as Dates (YAML 1.1); the
        // yaml package only does so with the timestamp tag enabled.
        data: rawBlogSchema.parse(
          parse(match[1], { customTags: ["timestamp"] })
        ),
        body: match[2],
      };
    });
