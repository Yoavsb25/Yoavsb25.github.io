# Architecture

## Overview

A fully static site: Astro renders every page to HTML at build time and GitHub Pages serves the `dist/` output. There is no server, database, or runtime API (ADR-0001, ADR-0002).

```
src/content (MD + YAML) ──┐
src/config/site.ts ───────┼─▶ Astro build (CI) ─▶ dist/ (HTML, CSS, images) ─▶ GitHub Pages
public/ (CV PDF, icons) ──┘
```

## Target structure

Primitives are grouped by type; everything page-specific is grouped by feature, so a new area of the site is a new folder rather than more files in a shared bucket.

```
src/
  config/site.ts              facts: url, name, title, email, socials, location (only place)
  content.config.ts           collection schemas (zod) — ADR-0005
  content/
    projects/<slug>/index.md  case study: structured frontmatter + optional deep-dive body (ADR-0014)
    projects/<slug>/cover.png optional colocated image, validated by the schema's image() helper
    experience/<id>.yaml      roles and education
    stages.yaml               How I work stages (one file, array)
    profile.yaml              prose only: status line, headline, lede, skills, contact copy
  lib/                        pure helpers: seo, og, crawlers, url, content ordering — unit tested
  assets/og/                  WOFF fonts for Open Graph images (ADR-0015)
  styles/tokens.css           design tokens, light + dark (ADR-0007)
  styles/global.css           reset, base type, shared utilities
  assets/portrait.jpg         hero photo (optimized at build)
  components/
    ui/                       primitives: Button, Chip, Icon, Panel, Window
    site/                     global chrome: Header, Footer, ThemeToggle, SkipLink
    home/                     Hero, HowIWork, WorkGrid, Resume, Contact
    case-study/               CaseStudy (the fixed structure), MetaRow, Toc, ResultTiles, NextProject
                              (phase 2: writing/)
  layouts/
    BaseLayout.astro          <head>: SEO, CSP, theme; site chrome
  pages/                      routes only: load data, compose feature components
    styleguide.astro          living style guide (noindex) for design and a11y review
tests/
  unit/                       src/lib and scripts/guards
  e2e/                        Playwright + axe per built page, byte budgets (ADR-0011)
```

`site.ts` owns facts that code depends on (URLs, email, JSON-LD). Content files own prose. Nothing appears in both.

## Layers and rules

Dependencies point one way (ADR-0006). Features are `home/`, `case-study/`, and later `writing/`.

| Layer             | May import                                     | Rule                                                                    |
| ----------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `pages/`          | layouts, features, site, ui, lib, config, data | Routing and data loading only                                           |
| `layouts/`        | site, ui, lib, config                          | Page shell and `<head>`                                                 |
| features          | ui, lib; `import type` from `astro:content`    | Data arrives as props; never load content; never import another feature |
| `components/site` | ui, lib, config                                | Global chrome                                                           |
| `components/ui`   | styles, other `ui/`                            | No data, no business logic; fully reusable                              |
| `lib/`            | config; `import type` from `astro:content`     | Pure TypeScript, no runtime Astro imports, unit tested                  |
| `content/`        | —                                              | Data only; validated at build time                                      |

Data flows one way: content/config → pages → features → ui. When a second feature needs a component, it moves to `ui/`.

**Enforcement** (lands with the first PR that creates `src/components/`): a `@/*` path alias in `tsconfig.json`, a ban on parent-relative imports (`../*`) in `src/`, and per-folder `@typescript-eslint/no-restricted-imports` blocks in `eslint.config.js` that encode the table above. `eslint.config.js` is the source of truth; `npm run verify` fails on a violation.

## Adding a case study

1. Run `/new-case-study`, or create `src/content/projects/<slug>/index.md` with the frontmatter fields (title, kicker, summary, tags, outcome, meta, problem, built ×3, approach, results ×3, order, featured, draft, optional cover). `/sync-projects` proposes candidates from GitHub.
2. Run `npm run verify`. The schema fails the build on a missing field or a wrong count. The home grid, `/projects/<slug>` route, next-project link, sitemap, and JSON-LD update without code changes.

## Rendering and interactivity

- Everything is prerendered HTML; zero client JS by default.
- Allowed scripts: the theme bootstrap (inline, CSP-hashed, ADR-0008), the theme toggle, the How I work stage selector, and closing the mobile header menu after a link tap. All are progressive enhancements; content renders without JS. Each needs a justification comment.
- Images use Astro's `<Image>` (build-time optimization, width/height set, lazy by default).

## SEO and machine-readability

`src/lib/seo.ts` builds titles, absolute URLs, and JSON-LD (`Person` on home, `CreativeWork` on case studies); `BaseLayout` renders the canonical URL, Open Graph, and X card tags from its props (`title`, `description`, `image`, `type`, `jsonLd`, `noindex`).

- Open Graph images: one 1200×630 PNG per indexable page, rendered at build by `src/lib/og.ts` (satori + sharp, ADR-0015) and served from `/og/`.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`: endpoints in `src/pages/` built by `src/lib/crawlers.ts` (ADR-0016). e2e checks the sitemap matches the indexable built pages.

## Security

See `docs/security.md`. Key points: CSP via `<meta>`, generated by Astro's built-in `security.csp` (script and style hashes computed at build, ADR-0008), no third-party scripts, self-hosted fonts.

## Quality gates

- **Local**: Claude hooks (as the agent acts) → lefthook (each commit and push) → `npm run verify`.
- **CI**: `verify`, `audit`, `actionlint`, `codeql`, `e2e` (Playwright + axe in both themes on desktop Chrome, and on iPhone WebKit; byte budgets; ADR-0011), `lighthouse` (ADR-0012), and `links` (internal, offline; ADR-0013) on every PR. External links weekly (`links.yml`).
- **Deploy**: every push to `main` runs `verify` and publishes `dist/` to GitHub Pages under `site.base` (ADR-0010).

## AI tooling

AI is a development tool, not a runtime feature (ADR-0003). Claude Code is configured in-repo so every contributor's agent follows the same rules:

- `CLAUDE.md` (+ nested ones per area as folders appear) — rules and context.
- `.claude/settings.json` — permissions and hook wiring.
- `.claude/hooks/*.mjs` — thin entry scripts; decisions live in `scripts/guards/rules.mjs` (shared with git hooks, unit tested).
- `.claude/skills/` and `.claude/agents/` — repeatable workflows: `/adr`, `/ship`, scaffolding (`/new-component`, `/new-page`), audits (`/design-review`, `/a11y-audit`, `/perf-audit`), and read-only review agents.
