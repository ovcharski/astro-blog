# Improvements

Codebase assessment done on 2026-07-05; all stages below were implemented and
merged on 2026-07-06. Kept as a record plus the one remaining optional item.

## Remaining

### Tailwind 3 → 4 (optional)

The only outdated package. A real migration, worth its own branch:

- Replace PostCSS setup with `@tailwindcss/vite`
- Move config CSS-first: `tailwind.config.cjs` (including the `withOpacity()`
  helper and `skin` utilities) reworks into `@theme` CSS variables
- `@tailwind base/components/utilities` directives in `src/styles/base.css`
  become `@import "tailwindcss"`
- Check `@tailwindcss/typography` and `prettier-plugin-tailwindcss` behavior
  after the switch

No forcing function: Tailwind 3 works fine on Astro 7 and has no security
issues.

## Completed (2026-07-06)

**Stage 1 — dependency refresh and hygiene** (PR #5)

- `npm update` for all minor/patch drift
- Easy major bumps: fuse.js 7, remark-toc 9, husky 9 (v9 hook format),
  lint-staged 17
- Deleted pnpm-only `.npmrc`; moved `@types/react-dom` to devDependencies;
  dropped unneeded `@types/github-slugger`

**Stage 2 — content layer and OG images** (PR #6)

- Migrated to Content Layer API: `src/content.config.ts` with glob loader,
  `render(post)` instead of legacy `post.render()`
- OG images now PNG (satori 0.2 → 0.26 + @resvg/resvg-js) — SVG og:image was
  not rendered by most social platforms. Slug-keyed `/posts/[slug].png` route
  with proper Content-Type, replacing the title-keyed `.svg` route

**Stage 3 — framework majors** (PR #7)

- Astro 5.18 → 7.0, @astrojs/react 4 → 6; cleared all npm audit findings
- remark-toc/remark-collapse kept via `@astrojs/markdown-remark`'s `unified()`
  processor (Astro 7 no longer defaults to remark); `compressHTML: true` keeps
  pre-v7 whitespace behavior
- Deprecated `@astrojs/tailwind` (peer-capped at Astro 5) replaced with plain
  PostCSS config
- Zod 4: schema imports from `astro/zod`
- eslint 10 (+ eslint-plugin-astro 2, astro-eslint-parser 2), typescript 6,
  prettier-plugin-tailwindcss 0.8

**Stage 4 — small cleanups** (PR #8)

- IBM Plex Mono self-hosted via @fontsource (Google Fonts CDN removed)
- Search.tsx: memoized Fuse index, `history.replaceState` instead of
  `pushState`
- Pruned 15 placeholder SOCIALS entries left from the AstroPaper template
