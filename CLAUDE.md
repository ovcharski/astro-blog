# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at localhost:4321
npm run build        # Build production site to ./dist/
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting without changes
npm run sync         # Generate TypeScript types for Astro modules

# Git Hooks
# Husky is configured with lint-staged to auto-format on commit
```

## Architecture Overview

### Tech Stack
- **Framework**: Astro 7 with static site generation
- **Styling**: TailwindCSS with custom theming system
- **UI Components**: React (for interactive components like search)
- **Content**: Type-safe markdown with Zod schemas
- **Deployment**: Cloudflare Pages

### Content Architecture

**Content Collections**: Blog posts are managed through Astro's Content Layer API. The collection is defined in `src/content.config.ts` with a `glob()` loader over `src/content/blog/`. The schema is defined in `src/content/_schemas.ts` using Zod:

```typescript
{
  author: string (optional)
  pubDatetime: date
  title: string
  postSlug: string (optional)
  featured: boolean (optional)
  draft: boolean (optional)
  tags: string[] (default: ["others"])
  ogImage: string (optional)
  description: string
}
```

**Post Rendering**: Posts use a dual-purpose dynamic route at `src/pages/posts/[slug].astro` that handles both:
- Individual post pages (when slug matches a post)
- Paginated post lists (when slug is a page number)

### Routing & Pages

- `/` - Home page with featured posts
- `/posts/` - All posts (paginated)
- `/posts/[slug]` - Individual post or paginated list
- `/posts/[page-number]` - Paginated posts list
- `/tags/` - All tags
- `/tags/[tag]` - Posts filtered by tag
- `/search` - Client-side fuzzy search using FuseJS
- `/about.md` - Static about page
- `/rss.xml.ts` - RSS feed generation
- `/posts/[slug].png.ts` - Dynamic OG image generation (PNG via Satori + resvg)

### Theming System

The site uses a custom CSS variable-based theming system in TailwindCSS:
- Colors are defined using CSS variables (`--color-text-base`, `--color-accent`, `--color-fill`, etc.)
- Tailwind extends with `skin` utilities (e.g., `text-skin-base`, `bg-skin-fill`)
- Utility function `withOpacity()` in `tailwind.config.cjs` enables opacity modifiers

### Key Utilities (`src/utils/`)

- `getSortedPosts.ts` - Filters drafts and sorts posts by date (newest first)
- `slugify.ts` - Generates URL-safe slugs from post frontmatter
- `getUniqueTags.ts` - Extracts unique tags from posts
- `getPostsByTag.ts` - Filters posts by tag
- `getPageNumbers.ts` - Calculates pagination based on `SITE.postPerPage`
- `generateOgImage.tsx` - Creates dynamic PNG OG images using Satori + @resvg/resvg-js

### Configuration

**Site Config** (`src/config.ts`): Contains site metadata, social links, and settings:
- `SITE.postPerPage` - Controls pagination (default: 10)
- `SITE.lightAndDarkMode` - Theme toggle setting
- `SOCIALS` - Array of social media links (filtered by `active` flag)

**Astro Config** (`astro.config.mjs`):
- Integrations: React, Sitemap, Matomo analytics (Tailwind runs via `postcss.config.mjs`, not an integration)
- Markdown: remark-toc and remark-collapse via `@astrojs/markdown-remark`'s `unified()` processor (set as `markdown.processor`, since Astro 7 no longer defaults to remark)
- Syntax highlighting: one-dark-pro theme

### Path Aliases

TypeScript paths are configured with `@*` alias pointing to `src/*`:
```typescript
import { SITE } from "@config";
import getSortedPosts from "@utils/getSortedPosts";
```

### Layouts

- `Layout.astro` - Base HTML wrapper with SEO meta tags
- `Main.astro` - Site shell with header/footer
- `Posts.astro` - Paginated posts list
- `PostDetails.astro` - Individual post with breadcrumbs
- `AboutLayout.astro` - Static about page wrapper

### Dynamic Features

**OG Image Generation**: Posts without a custom `ogImage` get dynamic PNG images (1200×630) generated at build time via `posts/[slug].png.ts`, rendered with Satori (IBM Plex Mono font) and rasterized with @resvg/resvg-js.

**Search**: Client-side fuzzy search implemented with FuseJS in `Search.tsx`, searching across post titles, descriptions, and content.

**Draft Posts**: Posts with `draft: true` are excluded from production builds but visible in development.

## Development Notes

- Content is in `src/content/blog/` as markdown files
- All blog posts must conform to the Zod schema or build will fail
- The `npm run sync` command regenerates TypeScript types when content schema changes
- ESLint is configured for both TypeScript and Astro files with custom parser
- Prettier runs automatically on commit via husky + lint-staged
