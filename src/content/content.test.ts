import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_DIR, loadRealPosts } from "@utils/testContent";

const posts = loadRealPosts();

// Site-local paths only: skip external URLs, data URIs and in-page anchors.
const isLocal = (src: string) => !/^([a-z]+:|\/\/|#)/i.test(src);

const bodyImages = (body: string) => [
  ...[...body.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)/g)].map(m => m[1]),
  ...[...body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]),
];

const missingFromPublic = (srcs: string[]) =>
  srcs
    .filter(isLocal)
    .map(src => src.split(/[?#]/)[0])
    .filter(src => !existsSync(path.join(PUBLIC_DIR, decodeURI(src))));

describe("blog content", () => {
  it("finds the posts", () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  it.each(posts.map(post => [post.file, post]))(
    "%s: ogImage exists in public/",
    (_, post) => {
      const { ogImage } = post.data;
      expect(missingFromPublic(ogImage ? [ogImage] : [])).toEqual([]);
    }
  );

  it.each(posts.map(post => [post.file, post]))(
    "%s: every local image in the body exists in public/",
    (_, post) => {
      expect(missingFromPublic(bodyImages(post.body))).toEqual([]);
    }
  );
});
