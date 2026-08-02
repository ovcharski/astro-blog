import { describe, expect, it } from "vitest";
import slugify, { slugifyAll, slugifyStr } from "./slugify";
import type { BlogFrontmatter } from "@content/_schemas";

const frontmatter = (
  data: Partial<BlogFrontmatter> & { title: string }
): BlogFrontmatter => data as BlogFrontmatter;

describe("slugifyStr", () => {
  it("lowercases and hyphenates words", () => {
    expect(slugifyStr("Hello World")).toBe("hello-world");
  });

  it("strips punctuation", () => {
    expect(slugifyStr("C++ & C#")).toBe("c--c");
  });

  it("preserves non-ASCII characters rather than transliterating them", () => {
    expect(slugifyStr("Кирилица")).toBe("кирилица");
    expect(slugifyStr("Ünïcödé")).toBe("ünïcödé");
  });

  it("returns an empty string for an empty title", () => {
    expect(slugifyStr("")).toBe("");
  });

  it("converts surrounding whitespace into leading and trailing hyphens", () => {
    // github-slugger targets heading anchors, not URLs, so it does not trim.
    expect(slugifyStr("  Trim  Me  ")).toBe("--trim--me--");
  });
});

describe("slugify", () => {
  it("prefers postSlug over title", () => {
    expect(
      slugify(frontmatter({ title: "The Title", postSlug: "Custom Slug" }))
    ).toBe("custom-slug");
  });

  it("falls back to the title when postSlug is absent", () => {
    expect(slugify(frontmatter({ title: "The Title" }))).toBe("the-title");
  });
});

describe("slugifyAll", () => {
  it("slugifies every entry", () => {
    expect(slugifyAll(["A B", "C"])).toEqual(["a-b", "c"]);
  });

  it("preserves length, so colliding slugs are not deduplicated", () => {
    expect(slugifyAll(["A B", "a-b"])).toEqual(["a-b", "a-b"]);
  });

  it("returns an empty array for no tags", () => {
    expect(slugifyAll([])).toEqual([]);
  });
});
