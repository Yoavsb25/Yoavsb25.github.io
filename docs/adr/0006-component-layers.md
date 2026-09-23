# 0006. Feature-grouped components with lint-enforced boundaries

- Status: accepted
- Date: 2026-09-23

## Context

The site should stay easy to change as pages and content grow, and Claude should be able to add pages and components predictably. Layering by convention decays, especially when an agent writes most files.

## Decision

- Group primitives by type (`components/ui`, `components/site`) and page-specific components by feature (`components/home`, `components/case-study`, later `components/writing`).
- Dependencies point one way: pages → layouts → features → ui, plus pure `lib/`. Only pages load content; features receive data as props and never import each other; `lib/` may use `import type` from `astro:content` but no runtime Astro imports. The full table is in `docs/architecture.md`.
- Enforce it with existing tooling, no new dependency: a `@/*` path alias, a ban on `../*` imports in `src/`, and per-folder `@typescript-eslint/no-restricted-imports` blocks in `eslint.config.js` (which also lint `.astro` frontmatter). `eslint.config.js` is the source of truth.

## Consequences

- A boundary violation fails `npm run verify`, not just review.
- A new site area is a new feature folder; existing features are untouched.
- The `/new-component` and `/new-page` skills can scaffold into a known slot.
- Imports across folders use `@/…`; a component reused by a second feature moves to `ui/`.
- Rejected: `eslint-plugin-boundaries` (a dependency for what core rules already do).
