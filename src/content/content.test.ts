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

// Optimized assets are resolved against the post file, as Astro does.
const nextToPost = (file: string) => (src: string) =>
  path.join(BLOG_DIR, path.dirname(file), src);

// In a post body, root-relative paths are served from public/.
const inBody = (file: string) => (src: string) =>
  src.startsWith("/") ? inPublic(src) : nextToPost(file)(src);

describe("blog content", () => {
  it("finds the posts", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it.each(posts.map(post => [post.file, post]))(
    "%s: ogImage exists next to the post",
    (_, post) => {
      const { ogImage } = post.data;
      expect(
        missingFiles(ogImage ? [ogImage] : [], nextToPost(post.file))
      ).toEqual([]);
    }
  );

  it.each(posts.map(post => [post.file, post]))(
    "%s: every local image in the body exists",
    (_, post) => {
      expect(missingFiles(bodyImages(post.body), inBody(post.file))).toEqual(
        []
      );
    }
  );
});
