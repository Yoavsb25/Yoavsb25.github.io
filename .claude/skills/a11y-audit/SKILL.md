---
name: a11y-audit
description: Accessibility audit of changed pages: a static source scan, then the a11y-reviewer agent in a real browser, then triage and fixes. Use on any PR that changes pages, components, or styles, before /ship, or when the user says "a11y audit", "accessibility check", "is this accessible", or "check contrast/keyboard/screen reader".
---

# /a11y-audit: is it usable by everyone?

Target: WCAG 2.2 AA, and the rules in `docs/design-system.md` → Accessibility. This skill finds the pages, runs the cheap checks itself, and hands the browser checks to the `a11y-reviewer` agent.

## Steps

1. **Find what changed.** `git diff --stat origin/main...HEAD -- src/`. List the routes that render the changed files (`/styleguide` for any `ui/` change).
2. **Static scan** of the changed files (Grep and Read):
   - Every `<img>` / `<Image>` has `alt`; decorative images and icons are `alt=""` or `aria-hidden="true"`.
   - Clickable things are `<a href>` or `<button>`, never a `div` or `span` with a click handler. Icon-only controls have an accessible name.
   - One `h1` per route, headings in order, landmarks come from `BaseLayout` (not duplicated).
   - No `tabindex` greater than 0; no `outline: none` without a replacement focus style.
   - Form fields have labels; state is exposed (`aria-pressed`, `aria-expanded`, `aria-live` where the design system says so).
   - Content that scripts enhance is present in the server-rendered HTML.
3. **Browser checks.** First `browser_navigate` to http://localhost:4321 (never `curl`). If it loads and the title ends with the site name from `src/config/site.ts`, reuse it; if nothing answers, start `npm run dev` in the background and confirm its banner says port 4321 (Astro silently moves to another port if 4321 is taken, and the browser may only reach 4321). If something else holds the port, ask the user to free it; never kill processes you did not start. Then dispatch the `a11y-reviewer` agent with the list of routes and the changed components to focus on. It checks structure, keyboard, contrast, no-JS content, reduced motion, layout, and console at 375, 768, and 1280 px in both themes.
4. **Triage** the combined findings. For each: confirm it against the source, then mark **blocker** (fails WCAG AA or a design-system accessibility rule), **should fix**, or **nit**. Drop anything that does not reproduce, and say why.
5. **Fix** blockers and should-fixes if the user agrees, then rerun `npm run verify` and re-dispatch the agent for the affected routes only.
6. **Report**: routes checked, what was fixed, what is left and why.

## Rules

- Never hide a problem to pass a check (no `aria-hidden` on real content, no removing focus styles).
- Contrast fixes change tokens in `src/styles/tokens.css` and `docs/design-system.md` together, and must hold in both themes.
- Stop the dev server if you started it.
- Automated axe checks in CI arrive with roadmap row 9; until then this audit is the gate.
