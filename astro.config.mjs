import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import matomo from "@jop-software/astro-matomo";

// https://astro.build/config
export default defineConfig({
  site: "https://ovcharski.com/",
  // Keep the pre-v7 whitespace behavior for inline elements in templates
  compressHTML: true,
  integrations: [
    react(),
    sitemap(),
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
});
