---
name: design-review
description: Visual review of changed pages and components against docs/design-system.md and the approved mockup, in a real browser, both themes, at phone, tablet, and desktop widths. Use on any PR that changes pages, components, or styles, or when the user says "design review", "does this match the design", "check the styling", or "how does it look".
---

# /design-review: does it look like the design?

Checks visual fidelity: tokens, type, spacing, hierarchy, components, and copy voice. Accessibility is `/a11y-audit`; speed is `/perf-audit`.

## Steps

1. **Find what changed.** `git diff --stat origin/main...HEAD -- src/`. List the routes that render the changed files (a `ui/` change is always visible on `/styleguide`).
2. **Read the reference.** `docs/design-system.md` (tokens, type, layout, shape, motion, components, voice), and the matching part of `docs/design/mockup.html` while it exists.
3. **Static scan** of the changed `.astro` and `.css` files (Grep tool):
   - Hex, `rgb(`, or `hsl(` colors outside `src/styles/tokens.css`.
   - `font-size`, `border-radius`, `box-shadow`, or `transition` values not taken from a token or from the numbers in the design system.
   - `font-family` anywhere but `tokens.css`.
   - Animations without a `prefers-reduced-motion` override.
4. **Browser pass.** Start `npm run dev` in the background (skip if http://localhost:4321 already responds). With the Playwright MCP tools, for each route, at widths 375, 768, and 1280, in light and dark theme (set `data-theme` on `<html>` with `browser_evaluate`, or use the header toggle):
   - Take a full-page screenshot into `.playwright-mcp/` named `<route>-<width>-<theme>.png`, and look at it.
   - Compare with the spec: colors and contrast feel right in both themes, type scale and serif/sans use, spacing rhythm and section padding, radii, borders and shadows, component anatomy (for example, Button 48px pill, header 70px), alignment to the content width, and nothing clipped or overflowing.
   - Hover and focus a sample of interactive elements: hover states and the 2px accent focus ring match.
   - Read the visible copy against Voice: first person, plain, one number per sentence, buttons say what happens.
5. **Report** findings grouped by route and width: what differs, where (`file:line` or selector), the design-system rule, the fix, and the screenshot. Mark **blocker**, **should fix**, or **nit**. If the page matches, say so plainly.
6. **Fix** blockers and should-fixes if the user agrees, then rerun the affected checks and `npm run verify`.

## Rules

- The design system wins over the mockup where they differ; flag the difference so one of them gets fixed.
- A deviation the user wants to keep is a design-system change: update `docs/design-system.md` in the same PR.
- Screenshots stay in `.playwright-mcp/` (gitignored); never commit them.
