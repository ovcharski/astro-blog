import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@config";
import slugify from "@utils/slugify";
import getSortedPosts from "@utils/getSortedPosts";

export async function GET() {
  const posts = await getCollection("blog");
  // getSortedPosts drops drafts and orders newest first, matching every
  // other listing route. Without it the feed follows glob order.
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(({ data }) => ({
      link: `posts/${slugify(data)}`,
      title: data.title,
      description: data.description,
      pubDate: new Date(data.pubDatetime),
    })),
  });
}
