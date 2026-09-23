# 0006. Layered components with one-way dependencies

- Status: accepted
- Date: 2026-09-23

## Context

The site should stay easy to change as pages and content grow, and Claude should be able to add pages and components predictably.

## Decision

Four presentation layers: `pages → layouts → components/sections → components/ui`, plus pure `lib/`. Dependencies only point downward; only pages load content; sections receive data as props; ui primitives know nothing about content. Rules are documented in `docs/architecture.md` and enforced with ESLint import restrictions once the folders exist.

## Consequences

- Components are isolated and testable; redesigns touch `ui/` and tokens, not pages.
- The `/new-component` and `/new-page` skills can scaffold into a known slot.
- Slight indirection for very small pages (accepted for consistency).
