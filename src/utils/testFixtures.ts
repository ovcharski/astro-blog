import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;

/**
 * Builds a blog entry carrying only the frontmatter the utils actually read.
 *
 * Cast through `unknown` because a real CollectionEntry also carries id,
 * collection, body and render(), none of which these functions touch.
 */
export const makePost = (
  data: Partial<BlogPost["data"]> & { title: string }
): BlogPost =>
  ({
    data: {
      pubDatetime: new Date("2024-01-01T00:00:00Z"),
      description: "",
      tags: [],
      ...data,
    },
  }) as unknown as BlogPost;
