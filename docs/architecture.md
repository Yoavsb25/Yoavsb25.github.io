# Architecture

## Overview

A fully static site: Astro renders every page to HTML at build time and GitHub Pages serves the `dist/` output. There is no server, database, or runtime API.

```
content & config ──▶ Astro build ──▶ static HTML/CSS ──▶ GitHub Pages
 (src/config, src/content)   (CI)          (dist/)
```

## Layers

| Layer        | Location                                                                       | Rule                                            |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| Config       | `src/config/`                                                                  | Single source of truth for site identity        |
| Content      | `src/content/` _(planned)_                                                     | Typed collections; schema errors fail the build |
| Logic        | `src/lib/`                                                                     | Pure functions, no Astro imports, unit tested   |
| Presentation | `src/components/`, `src/layouts/`, `src/pages/` _(components/layouts planned)_ | Render data, no business logic                  |

Data flows one way: config/content → pages → components.

## Quality gates

Local: lefthook (format, lint, commit message) → `npm run verify`.
CI: `verify`, `audit`, `actionlint`, `codeql` on every PR. Later: e2e + axe, Lighthouse budgets, link checks.

## AI tooling

AI is a development tool, not a runtime feature. Claude Code is configured in-repo (`CLAUDE.md`, `.claude/`) so every contributor's agent follows the same rules. See ADR-0003.
