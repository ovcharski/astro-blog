import { describe, expect, it } from "vitest";
import getUniqueTags from "./getUniqueTags";
import { makePost } from "./testFixtures";

describe("getUniqueTags", () => {
  it("returns an empty array when given no posts", () => {
    expect(getUniqueTags([])).toEqual([]);
  });

  it("slugifies the tags it returns", () => {
    const posts = [makePost({ title: "a", tags: ["Web Dev"] })];

    expect(getUniqueTags(posts)).toEqual(["web-dev"]);
  });

  it("collapses tags that differ only by case or spacing", () => {
    const posts = [
      makePost({ title: "a", tags: ["Testing", "testing"] }),
      makePost({ title: "b", tags: ["TESTING"] }),
    ];

    expect(getUniqueTags(posts)).toEqual(["testing"]);
  });

  it("collects tags across several posts", () => {
    const posts = [
      makePost({ title: "a", tags: ["react"] }),
      makePost({ title: "b", tags: ["astro", "react"] }),
    ];

    expect(getUniqueTags(posts).sort()).toEqual(["astro", "react"]);
  });

  it("ignores tags that appear only on drafts", () => {
    const posts = [
      makePost({ title: "published", tags: ["react"] }),
      makePost({ title: "hidden", tags: ["secret"], draft: true }),
    ];

    expect(getUniqueTags(posts)).toEqual(["react"]);
  });

  it("still returns a tag shared by a draft and a published post", () => {
    const posts = [
      makePost({ title: "published", tags: ["react"] }),
      makePost({ title: "hidden", tags: ["react"], draft: true }),
    ];

    expect(getUniqueTags(posts)).toEqual(["react"]);
  });
});
