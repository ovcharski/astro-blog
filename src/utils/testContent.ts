import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { blogSchema, type BlogFrontmatter } from "@content/_schemas";

export const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

export type RealPost = {
  file: string;
  data: BlogFrontmatter;
  body: string;
};

/**
 * Reads the real posts from disk, so tests can check the published content
 * rather than fixtures. Mirrors the glob loader in content.config.ts: `.md`
 * files whose name does not start with `_`.
 */
export const loadRealPosts = (): RealPost[] =>
  readdirSync(BLOG_DIR)
    .filter(file => file.endsWith(".md") && !file.startsWith("_"))
    .map(file => {
      const source = readFileSync(path.join(BLOG_DIR, file), "utf8");
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!match) throw new Error(`${file} has no frontmatter`);
      return {
        file,
        // Astro's loader reads unquoted timestamps as Dates (YAML 1.1); the
        // yaml package only does so with the timestamp tag enabled.
        data: blogSchema.parse(parse(match[1], { customTags: ["timestamp"] })),
        body: match[2],
      };
    });
