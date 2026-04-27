# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Astro static site** for the "Tech with Ngurah Bagus" blog at `twnb.nbtrisna.my.id`. Content is written in Markdown under `src/content/posts/`. The site preserves the original Ghost CMS theme (dark background `#151515`, accent `#b6bdff`, Inter font).

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build for production (output: dist/client/)
npm run preview  # Preview production build locally
npm run convert  # Re-run HTML-to-Markdown conversion (if old HTML posts exist)
```

## Architecture

- **SSG:** Astro v6 with `@astrojs/cloudflare` adapter for Cloudflare Pages
- **Content:** Astro Content Collections (`src/content.config.ts`) with Zod schemas
  - `posts/` — 36 blog posts (Markdown with YAML frontmatter)
  - `pages/` — Static pages (about)
- **Styling:** Original Ghost theme CSS (`public/assets/built/screen.css`) reused verbatim. CSS custom properties control theming. Syntax highlighting via Prism + Dracula theme (client-side, loaded from CDN).
- **URL structure:** `/<slug>/`, `/tag/<tag>/`, `/author/ngurah/`, `/about/`, `/page/2/`
- **Static assets:** Images in `public/content/images/`, fonts in `public/assets/fonts/`, theme JS in `public/assets/built/`

## Key files

| Path | Purpose |
|------|---------|
| `src/content.config.ts` | Content collection schemas |
| `src/layouts/BaseLayout.astro` | HTML shell (head, CSS, meta tags, Prism) |
| `src/layouts/PostLayout.astro` | Post template with related posts |
| `src/layouts/HomeLayout.astro` | Homepage listing with pagination |
| `src/pages/[...slug].astro` | Post routes (dynamic) |
| `src/pages/tag/[tag].astro` | Tag archive routes |
| `src/pages/author/[author].astro` | Author page route |
| `src/pages/page/[page].astro` | Pagination routes |
| `src/components/Header.astro` | Navigation (replicates `gh-navigation`) |
| `src/components/PostCard.astro` | Post card for listings |
| `scripts/convert.mts` | One-time HTML→MD conversion script (cheerio + turndown) |

## CI/CD

Push to `main` triggers `.github/workflows/deploy.yaml`: `npm ci → npm run build → wrangler pages deploy dist/client`. Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.
