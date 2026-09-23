---
name: design-review
description: Visual review of changed pages and components against docs/design-system.md, in a real browser, both themes, at phone, tablet, and desktop widths. Use on any PR that changes pages, components, or styles, or when the user says "design review", "does this match the design", "check the styling", or "how does it look".
---

# /design-review: does it look like the design?

Checks visual fidelity: tokens, type, spacing, hierarchy, components, and copy voice. Accessibility is `/a11y-audit`; speed is `/perf-audit`.

## Steps

1. **Find what changed.** `git diff --stat origin/main...HEAD -- src/`. List the routes that render the changed files (a `ui/` change is always visible on `/styleguide`).
2. **Read the reference.** `docs/design-system.md` (tokens, type, layout, shape, motion, components, voice). The approved mockup was retired in `feat/pages`; the built pages are now the reference, with the design system as the rule.
3. **Static scan** of the changed `.astro` and `.css` files (Grep tool):
   - Hex, `rgb(`, or `hsl(` colors outside `src/styles/tokens.css`.
   - `font-size`, `border-radius`, `box-shadow`, or `transition` values not taken from a token or from the numbers in the design system.
   - `font-family` anywhere but `tokens.css`.
   - Animations without a `prefers-reduced-motion` override.
4. **Browser pass.** First `browser_navigate` to http://localhost:4321/ (port 4321 plus `site.base` from `src/config/site.ts`; never `curl`). Every route lives under that base, e.g. `/styleguide`. If it loads and the title ends with the site name from `src/config/site.ts`, reuse it; if nothing answers, start `npm run dev` in the background and confirm its banner says port 4321 (Astro silently moves to another port if 4321 is taken, and the browser may only reach 4321). If something else holds the port, ask the user to free it; never kill processes you did not start. Then, with the Playwright MCP tools, for each route, at widths 375, 768, and 1280, in light and dark theme (set `data-theme` on `<html>` with `browser_evaluate`, or use the header toggle):
   - Take a full-page screenshot into `.playwright-mcp/` named `<slug>-<width>-<theme>.png`, where the slug is `home` for `/` and the path with `/` replaced by `-` otherwise (files stay flat in the folder), and look at it.
   - Compare with the spec: colors and contrast feel right in both themes, type scale and serif/sans use, spacing rhythm and section padding, radii, borders and shadows, component anatomy (for example, Button 48px pill, header 70px), alignment to the content width, and nothing clipped or overflowing.
   - Hover and focus a sample of interactive elements: hover states and the 2px accent focus ring match.
   - Read the visible copy against Voice: first person, plain, one number per sentence, buttons say what happens.
5. **Report** findings grouped by route and width: what differs, where (`file:line` or selector), the design-system rule, the fix, and the screenshot. Mark **blocker**, **should fix**, or **nit**. If the page matches, say so plainly.
6. **Fix** blockers and should-fixes if the user agrees, then rerun the affected checks and `npm run verify`.

## Rules

- A deviation the user wants to keep is a design-system change: update `docs/design-system.md` in the same PR.
- Stop the dev server if you started it.
- Screenshots stay in `.playwright-mcp/` (gitignored); never commit them.
