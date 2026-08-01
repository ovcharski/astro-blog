import { describe, expect, it } from "vitest";
import getPageNumbers from "./getPageNumbers";
import { SITE } from "@config";

const perPage = SITE.postPerPage;

describe("getPageNumbers", () => {
  it("returns no pages when there are no posts", () => {
    expect(getPageNumbers(0)).toEqual([]);
  });

  it("returns one page when posts do not fill it", () => {
    expect(getPageNumbers(1)).toEqual([1]);
    expect(getPageNumbers(perPage - 1)).toEqual([1]);
  });

  it("returns one page when posts fill it exactly", () => {
    expect(getPageNumbers(perPage)).toEqual([1]);
  });

  it("adds a page as soon as a single post spills over", () => {
    expect(getPageNumbers(perPage + 1)).toEqual([1, 2]);
  });

  it("does not add an empty trailing page on an exact multiple", () => {
    expect(getPageNumbers(perPage * 3)).toEqual([1, 2, 3]);
  });

  it("numbers pages consecutively starting at 1", () => {
    expect(getPageNumbers(perPage * 4 + 1)).toEqual([1, 2, 3, 4, 5]);
  });
});
