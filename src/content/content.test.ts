import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BLOG_DIR, PUBLIC_DIR, loadRealPosts } from "@utils/testContent";

const posts = loadRealPosts();

// Site-local paths only: skip external URLs, data URIs and in-page anchors.
const isLocal = (src: string) => !/^([a-z]+:|\/\/|#)/i.test(src);

const bodyImages = (body: string) => [
  ...[...body.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/g)].map(m => m[1]),
  ...[...body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]),
];

const missingFiles = (srcs: string[], resolve: (src: string) => string) =>
  srcs
    .filter(isLocal)
    .map(src => decodeURI(src.split(/[?#]/)[0]))
    .filter(src => !existsSync(resolve(src)));

const inPublic = (src: string) => path.join(PUBLIC_DIR, src);

// In a post body, root-relative paths are served from public/ and relative
// ones are optimized assets resolved against the post file, as Astro does.
const inBody = (src: string) =>
  src.startsWith("/") ? inPublic(src) : path.join(BLOG_DIR, src);

describe("blog content", () => {
  it("finds the posts", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it.each(posts.map(post => [post.file, post]))(
    "%s: ogImage exists in public/",
    (_, post) => {
      const { ogImage } = post.data;
      expect(missingFiles(ogImage ? [ogImage] : [], inPublic)).toEqual([]);
    }
  );

  it.each(posts.map(post => [post.file, post]))(
    "%s: every local image in the body exists",
    (_, post) => {
      expect(missingFiles(bodyImages(post.body), inBody)).toEqual([]);
    }
  );
});
