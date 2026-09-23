# Architecture

## Overview

A fully static site: Astro renders every page to HTML at build time and GitHub Pages serves the `dist/` output. There is no server, database, or runtime API (ADR-0001, ADR-0002).

```
src/content (MDX + YAML) ─┐
src/config/site.ts ───────┼─▶ Astro build (CI) ─▶ dist/ (HTML, CSS, images) ─▶ GitHub Pages
public/ (cv.pdf, icons) ──┘
```

## Target structure

```
src/
  config/site.ts            site identity: URL, name, title, links (single source of truth)
  content.config.ts         collection schemas (zod) — ADR-0005
  content/
    projects/<slug>.mdx     case studies
    experience/<id>.yaml    roles
    profile.yaml            bio, skills, availability
  lib/                      pure helpers: seo, dates, sorting, formatting — unit tested
  styles/tokens.css         design tokens, light + dark (ADR-0007)
  styles/global.css         reset, base type, shared utilities
  assets/portrait.jpg       hero photo (optimized at build)
  components/
    ui/                     primitives: Button, Link, Tag, Card, Icon, Prose
    sections/               page sections: Hero, FeaturedProjects, ExperienceTimeline, CtaBlock
    layout/                 Header, Footer, ThemeToggle, SkipLink
  layouts/
    BaseLayout.astro        <head>: SEO, CSP, theme; header/footer shell
    CaseStudyLayout.astro   fixed case-study structure
  pages/                    routes only: fetch data, compose sections
tests/
  unit/                     src/lib and scripts/guards
  e2e/                      Playwright + axe per page (deploy PR)
```

## Layers and rules

Dependencies point downward only (ADR-0006):

| Layer                  | May import                      | Rule                                                    |
| ---------------------- | ------------------------------- | ------------------------------------------------------- |
| `pages/`               | layouts, sections, lib, content | Routing and data loading only; no styling beyond layout |
| `layouts/`             | layout, ui, lib, config         | Page shell and `<head>`                                 |
| `components/sections/` | ui, lib                         | Receive data as props; never call `getCollection`       |
| `components/ui/`       | tokens only                     | No data, no business logic; fully reusable              |
| `lib/`                 | config                          | Pure TypeScript, no Astro imports, 100% unit tested     |
| `content/`             | —                               | Data only; validated at build time                      |

Data flows one way: content/config → pages → sections → ui.

## Rendering and interactivity

- Everything is prerendered HTML; zero client JS by default.
- Allowed scripts: the theme bootstrap (inline, CSP-hashed, ADR-0008), the theme toggle, the How I work stage selector, and the copy-email button. All are progressive enhancements; content renders without JS. Each needs a justification comment.
- Images use Astro's `<Image>` (build-time optimization, width/height set, lazy by default).

## SEO and machine-readability

One `seo` helper in `src/lib` builds title, description, canonical, Open Graph, and JSON-LD (`Person` on home, `CreativeWork` on case studies). Build-time OG images, `sitemap`, `robots.txt`, `llms.txt`.

## Security

See `docs/security.md`. Key points: CSP via `<meta>`, no third-party scripts, self-hosted fonts.

## Quality gates

- **Local**: Claude hooks (as the agent acts) → lefthook (each commit and push) → `npm run verify`.
- **CI**: `verify`, `audit`, `actionlint`, `codeql` on every PR. Deploy PR adds e2e + axe, Lighthouse budgets, link checks.

## AI tooling

AI is a development tool, not a runtime feature (ADR-0003). Claude Code is configured in-repo so every contributor's agent follows the same rules:

- `CLAUDE.md` (+ nested ones per area as folders appear) — rules and context.
- `.claude/settings.json` — permissions and hook wiring.
- `.claude/hooks/*.mjs` — thin entry scripts; decisions live in `scripts/guards/rules.mjs` (shared with git hooks, unit tested).
- `.claude/skills/` and `.claude/agents/` — repeatable workflows (later PRs).
