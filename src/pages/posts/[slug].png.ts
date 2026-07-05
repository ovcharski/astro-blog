import { getCollection } from "astro:content";
import generateOgImage from "@utils/generateOgImage";
import slugify from "@utils/slugify";
import type { APIRoute } from "astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);

  return posts
    .filter(({ data }) => !data.ogImage)
    .map(({ data }) => ({
      params: { slug: slugify(data) },
      props: { title: data.title },
    }));
}

export const GET: APIRoute<{ title: string }> = async ({ props }) => {
  const body = await generateOgImage(props.title);
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "image/png" },
  });
};
