import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";
import Tag from "./Tag.astro";
import getUniqueTags from "@utils/getUniqueTags";
import { loadRealPosts } from "@utils/testContent";
import { makePost } from "@utils/testFixtures";

const posts = loadRealPosts().map(({ data: { title, tags, draft } }) =>
  makePost({ title, tags, draft })
);

// The URLs src/pages/tags/[tag].astro generates.
const tagPages = new Set(getUniqueTags(posts).map(tag => `/tags/${tag}/`));

const publishedTags = [
  ...new Set(posts.filter(({ data }) => !data.draft).flatMap(p => p.data.tags)),
];

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
});

const renderHref = async (name: string) => {
  const html = await container.renderToString(Tag, { props: { name } });
  const href = html.match(/href="([^"]*)"/)?.[1];
  if (href === undefined) throw new Error(`no href rendered for "${name}"`);
  return decodeURI(href);
};

describe("Tag", () => {
  it.each(publishedTags)(
    "links the post tag %j to a generated tag page",
    async name => {
      expect(tagPages).toContain(await renderHref(name));
    }
  );

  it.each(["Raspberry Pi", "H.265", "Web  Dev", "C++"])(
    "links %j to its slugified tag page",
    async name => {
      const page = getUniqueTags([makePost({ title: "x", tags: [name] })])[0];
      expect(await renderHref(name)).toBe(`/tags/${page}/`);
    }
  );
});
