---
name: new-component
description: Scaffold a new Astro component in the right layer (ui, site, home, case-study) following ADR-0006 and the design system. Use when the user says "add a component", "create a <Name> component", "new card/section/primitive", or when a page needs a piece that does not exist yet in src/components/.
---

# /new-component: add a component in the right layer

A component's folder decides what it may import (`docs/architecture.md` → Layers and rules, enforced by `eslint.config.js`). Pick the folder first; the rest follows.

## Steps

1. **Check it does not exist.** `ls src/components/*/` and read any component with a similar job. Extending one with a prop beats adding a near-duplicate.
2. **Pick the layer**, and say which and why in one line:
   - `ui/`: a primitive with no data or business logic, reusable anywhere (Button, Chip, Panel). May import styles only.
   - `site/`: global chrome on every page (Header, Footer, ThemeToggle).
   - `home/` or `case-study/`: a feature section used by one area. Data arrives as props; never load content; never import another feature. When a second feature needs it, it moves to `ui/`.
3. **Read the spec.** Find the component in `docs/design-system.md` → Components (and `docs/design/mockup.html` while it exists). If it is not specified, ask the user how it should look before writing it; do not invent a design.
4. **Write `src/components/<layer>/<PascalName>.astro`**, following `src/components/ui/Chip.astro`:
   - A one-line `/** */` comment: what it is, and the design-system section it implements.
   - `interface Props` with explicit types and defaults in the destructure. Content-shaped props use `import type` from `astro:content` (features only).
   - Scoped `<style>` using tokens only: `var(--…)` for color, space, radius, type, and motion. No hex colors, no new font sizes outside the type scale (ADR-0007).
   - Semantic HTML first: a real `<button>` or `<a>`, headings passed in at the right level, `alt` or `aria-hidden` on images and icons.
   - Motion uses `--ease` and the listed durations, and stops under `prefers-reduced-motion`.
   - No `<script>` unless the design system lists it as allowed interactivity; if so, add a comment justifying it and make the content work without it.
5. **Logic goes to `src/lib/`.** Anything beyond formatting props (sorting, date math, string building) becomes a pure function in `src/lib/` with a test in `tests/unit/`, written test-first.
6. **Show it.** A `ui/` primitive gets a section in `src/pages/styleguide.astro` showing every variant. A feature component is wired into its page (or the page's PR, if later).
7. **Verify.** `npm run verify`. A lint error on an import means the layer is wrong: move the component or pass the data as a prop instead of silencing the rule.
8. **Review.** Run `/design-review` and `/a11y-audit` on the page that shows it.

## Rules

- One component per file; PascalCase file name matches its use.
- No new dependency for a component without an ADR (`/adr`).
- Keep props minimal: add a variant when a real use needs it, not in advance.
