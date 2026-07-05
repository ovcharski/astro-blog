# Improvement Suggestions

Assessment of the codebase and dependency state as of 2026-07-05.

**Status update (2026-07-06):** Stage 1 is done — minor updates applied via
`npm update`; fuse.js 7, remark-toc 9, husky 9 and lint-staged 17 bumped;
`.npmrc` deleted; package.json hygiene fixed (types moved to devDependencies,
`@types/github-slugger` removed); husky hook migrated to v9 format. Verified
with build, lint and `astro check`.

**Status update (2026-07-06, later):** Stage 2 is done — §2.2 Content Layer
migration (`src/content.config.ts` with glob loader, `render(post)`) and §2.1
PNG OG images (satori 0.26 + @resvg/resvg-js, slug-keyed `/posts/[slug].png`
route with proper Content-Type). Verified: build green, generated image is a
valid 1200×630 PNG, og:image/twitter:image meta point to it.

**Status update (2026-07-06, stage 3):** §2.3 done — Astro 5.18 → 7.0,
@astrojs/react 4 → 6, eslint 10 (+ plugin/parser 2.x), typescript 6,
prettier-plugin-tailwindcss 0.8. Deprecated @astrojs/tailwind replaced with
plain PostCSS config (tailwindcss + autoprefixer). remark-toc/remark-collapse
kept via @astrojs/markdown-remark's `unified()` processor; shikiConfig stays
top-level. `compressHTML: true` set to keep pre-v7 whitespace behavior.
`npm audit`: 0 vulnerabilities. Verified: build, astro check, lint,
format:check, TOC/collapse + one-dark-pro highlighting + OG PNG in dist.
Remaining: §3 Search.tsx / fonts / SOCIALS cleanups, and Tailwind 4
(now the only outdated package).

## 1. Dependency status

### Minor/patch drift (safe, one `npm update` away)

| Package | Current | Wanted |
| --- | --- | --- |
| astro | 5.17.1 | 5.18.2 |
| @astrojs/check | 0.9.6 | 0.9.9 |
| @astrojs/rss | 4.0.15 | 4.0.19 |
| @astrojs/sitemap | 3.7.0 | 3.7.3 |
| @tailwindcss/typography | 0.5.19 | 0.5.20 |
| @typescript-eslint/parser | 8.55.0 | 8.62.1 |
| eslint / @eslint/js | 9.39.2 | 9.39.4 |
| prettier | 3.8.1 | 3.9.4 |
| react / react-dom | 19.2.4 | 19.2.7 |
| @types/react | 19.2.13 | 19.2.17 |
| lint-staged | 16.2.7 | 16.4.0 |

### Major versions behind

| Package | Current | Latest | Notes |
| --- | --- | --- | --- |
| astro | 5.18 | 7.0.6 | Two majors behind. Blocked mainly by the legacy content collections API (see §2.2). |
| tailwindcss | 3.4 | 4.3 | Real migration effort. `@astrojs/tailwind` is deprecated in favor of `@tailwindcss/vite`; config moves CSS-first. Riskiest upgrade here. |
| satori | 0.2.5 | 0.26.0 | 0.2.x is from 2022 — the most stale package in the project. Upgrade pairs naturally with the PNG OG image fix (§2.1). |
| @astrojs/react | 4.4 | 6.0.1 | |
| eslint | 9 | 10.6 | Plugin ecosystem (eslint-plugin-astro 2.x, astro-eslint-parser 2.x) should be bumped together. |
| typescript | 5.9 | 6.0.3 | |
| fuse.js | 6.6 | 7.4 | Trivial bump. |
| husky | 8 | 9.1 | `"prepare": "husky install"` is deprecated in v9 → becomes `"prepare": "husky"`. |
| lint-staged | 16 | 17 | |
| remark-toc | 8 | 9 | |
| prettier-plugin-tailwindcss | 0.6 | 0.8 | Bump alongside the Tailwind decision. |

## 2. Major code improvements

### 2.1 OG images are SVGs — most social platforms won't render them

Posts without a custom `ogImage` get a Satori-generated **SVG**
(`src/layouts/PostDetails.astro:21`). Facebook, LinkedIn and X do not support
SVG in `og:image`. The Twitter meta tag in `src/layouts/Layout.astro:58-63`
already works around this by falling back to the default JPG — but `og:image`
itself still points at the SVG, so shared posts lose their generated card.

**Fix:** upgrade satori and render PNG via `@resvg/resvg-js`
(route becomes `[slug]/og.png` or similar).

Two smaller bugs in the same area:

- `src/pages/[ogTitle].svg.ts:7` returns the response without a
  `Content-Type: image/svg+xml` header.
- The route uses the raw post **title** as the URL parameter — a title
  containing `#`, `?` or `/` would produce a broken image URL. It should key
  off the post slug instead.

### 2.2 Legacy content collections API

`src/content/config.ts` uses the pre-Astro-5 `defineCollection` without a
`loader`. Astro 5 only supports this in legacy compatibility mode, and it is
the main blocker for upgrading to Astro 6/7.

**Fix:** migrate to the Content Layer API:

- `src/content.config.ts` with `glob({ pattern: "**/*.md", base: "./src/content/blog" })`
- `render(post)` imported from `astro:content` instead of `post.render()`
- Optionally drop the custom `slugify` plumbing (`src/utils/slugify.ts`) in
  favor of Astro's built-in entry IDs/slugs.

### 2.3 Astro 5 → 7 upgrade

Mostly depends on §2.2 being done first. Suggested order: minors → content
layer migration → Astro 7 (→ Tailwind 4 separately, if desired).

## 3. Smaller cleanups

- **Search (`src/components/Search.tsx`)**
  - `:33` — the Fuse index is rebuilt on every render/keystroke; wrap in `useMemo`.
  - `:66` — `history.pushState` per keystroke floods browser history (Back
    button steps through every typed character); use `replaceState`.
- **Self-host fonts** — `src/layouts/Layout.astro:66-71` loads IBM Plex Mono
  from Google's CDN, while the same font is already bundled locally in
  `src/assets/fonts/` for OG images. Self-hosting as woff2 is faster and more
  private (consistent with choosing Matomo over GA).
- **package.json hygiene**
  - `react` / `react-dom` are in `devDependencies` while `@types/react-dom`
    is in `dependencies` — placement is inverted; make them consistent.
  - `@types/github-slugger` is unnecessary — github-slugger v2 ships its own types.
- **`.npmrc`** — contains `shamefully-hoist=true`, a pnpm-only option. npm
  already warns it will become an error in the next npm major. The project
  uses npm (`package-lock.json`), so the file can be deleted.
- **`src/config.ts`** — ~17 inactive `SOCIALS` entries still point at the
  original AstroPaper template author's repo. Harmless (filtered by `active`),
  but dead weight worth pruning.

## 4. Suggested staging

1. **Safe refresh:** `npm update` minors + §3 hygiene fixes + easy major bumps
   (fuse.js, husky, lint-staged, remark-toc). Verify with `npm run build`.
2. **Content layer + OG images:** §2.2 migration, then §2.1 PNG OG images with
   updated satori + resvg. Verify OG output and all routes.
3. **Framework majors:** Astro 7, @astrojs/react 6, eslint 10, typescript 6.
4. **Tailwind 4** (optional, riskiest): `@tailwindcss/vite`, CSS-first config,
   rework the `withOpacity()`/skin utility theming in `tailwind.config.cjs`.
