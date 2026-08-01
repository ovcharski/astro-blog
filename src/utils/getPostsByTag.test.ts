import { describe, expect, it } from "vitest";
import getPostsByTag from "./getPostsByTag";
import { makePost } from "./testFixtures";

const posts = [
  makePost({ title: "react post", tags: ["React"] }),
  makePost({ title: "astro post", tags: ["Astro", "Web Dev"] }),
  makePost({ title: "untagged post", tags: [] }),
];

const titles = (result: typeof posts) => result.map(post => post.data.title);

describe("getPostsByTag", () => {
  it("returns posts carrying the tag", () => {
    expect(titles(getPostsByTag(posts, "react"))).toEqual(["react post"]);
  });

  it("matches a post's second tag, not just its first", () => {
    expect(titles(getPostsByTag(posts, "web-dev"))).toEqual(["astro post"]);
  });

  it("returns an empty array when no post carries the tag", () => {
    expect(getPostsByTag(posts, "nonexistent")).toEqual([]);
  });

  it("expects an already-slugified tag, so a raw tag name matches nothing", () => {
    expect(getPostsByTag(posts, "Web Dev")).toEqual([]);
  });

  it("returns an empty array when given no posts", () => {
    expect(getPostsByTag([], "react")).toEqual([]);
  });

  it("does not filter out drafts, leaving that to the caller", () => {
    const withDraft = [
      makePost({ title: "published", tags: ["React"] }),
      makePost({ title: "hidden", tags: ["React"], draft: true }),
    ];

    expect(titles(getPostsByTag(withDraft, "react"))).toEqual([
      "published",
      "hidden",
    ]);
  });
});
