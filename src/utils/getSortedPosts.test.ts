import { describe, expect, it } from "vitest";
import getSortedPosts from "./getSortedPosts";
import { makePost } from "./testFixtures";

const titles = (posts: ReturnType<typeof getSortedPosts>) =>
  posts.map(post => post.data.title);

describe("getSortedPosts", () => {
  it("returns an empty array when given no posts", () => {
    expect(getSortedPosts([])).toEqual([]);
  });

  it("orders posts newest first", () => {
    const posts = [
      makePost({ title: "old", pubDatetime: new Date("2020-01-01") }),
      makePost({ title: "new", pubDatetime: new Date("2024-01-01") }),
      makePost({ title: "middle", pubDatetime: new Date("2022-01-01") }),
    ];

    expect(titles(getSortedPosts(posts))).toEqual(["new", "middle", "old"]);
  });

  it("excludes drafts", () => {
    const posts = [
      makePost({ title: "published", pubDatetime: new Date("2020-01-01") }),
      makePost({
        title: "hidden",
        pubDatetime: new Date("2024-01-01"),
        draft: true,
      }),
    ];

    expect(titles(getSortedPosts(posts))).toEqual(["published"]);
  });

  it("treats a missing draft flag as published", () => {
    const posts = [makePost({ title: "published" })];

    expect(titles(getSortedPosts(posts))).toEqual(["published"]);
  });

  it("does not mutate the array it is given", () => {
    const posts = [
      makePost({ title: "old", pubDatetime: new Date("2020-01-01") }),
      makePost({ title: "new", pubDatetime: new Date("2024-01-01") }),
    ];

    getSortedPosts(posts);

    expect(titles(posts)).toEqual(["old", "new"]);
  });

  it("compares only whole seconds, so sub-second gaps keep source order", () => {
    // The comparator floors both timestamps to seconds, making these equal.
    const posts = [
      makePost({
        title: "first",
        pubDatetime: new Date("2024-01-01T00:00:00.000Z"),
      }),
      makePost({
        title: "second",
        pubDatetime: new Date("2024-01-01T00:00:00.500Z"),
      }),
    ];

    expect(titles(getSortedPosts(posts))).toEqual(["first", "second"]);
  });
});
