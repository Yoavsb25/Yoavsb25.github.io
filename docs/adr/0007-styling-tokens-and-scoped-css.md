# 0007. Styling with design tokens and scoped CSS (no Tailwind)

- Status: accepted
- Date: 2026-09-23

## Context

The design system (`docs/design-system.md`) is a small, precise set of tokens: two themes, one type scale, one motion curve. The original plan considered Tailwind v4. The approved mockup was built with plain CSS and custom properties, and the site has few components.

## Decision

- Tokens live as CSS custom properties in `src/styles/tokens.css` (light on `:root`, dark under `prefers-color-scheme` and `[data-theme="dark"]`).
- Components use Astro's scoped `<style>` blocks that reference tokens only. No hex values or ad-hoc sizes in components.
- A small `src/styles/global.css` holds the reset, base typography, and shared utilities (`.label`, `.serif`, `.wrap`).
- No Tailwind or CSS-in-JS.

## Consequences

- Zero styling dependencies, and the CSS reads like the design doc.
- Theme switching is a token swap; components never branch on theme.
- Rules such as "tokens only" are enforced by review and a future stylelint rule rather than a framework.
- Rejected: Tailwind v4, which would add a dependency and a second vocabulary for a small, token-driven site.
