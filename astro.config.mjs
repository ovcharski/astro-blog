import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import matomo from "@jop-software/astro-matomo";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://ovcharski.com/",
  trailingSlash: "always",
  // Keep the pre-v7 whitespace behavior for inline elements in templates
  compressHTML: true,
  integrations: [
    react(),
    sitemap({
      // Individual tag pages are thin and noindexed; the /tags/ index stays
      filter: page =>
        !page.endsWith("/search/") && !/\/tags\/[^/]+\/$/.test(page),
    }),
    matomo({
      baseUrl: "https://ovcharski.com/analytics/",
      siteId: 11,
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [
          remarkCollapse,
          {
            test: "Table of contents",
          },
        ],
      ],
    }),
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    ssr: {
      external: ["@resvg/resvg-js"],
    },
  },
});
