---
name: perf-audit
description: Performance audit of the production build: bytes shipped per page against budgets, scripts, fonts, images, and Core Web Vitals measured in a real browser. Use on PRs that add pages, components, images, fonts, or scripts, before launch, or when the user says "perf audit", "is it fast", "page weight", "bundle size", or "check Lighthouse".
---

# /perf-audit: is it fast?

Goal from `docs/product-brief.md`: Lighthouse performance ≥ 95 in both themes. CI enforces the byte budgets (`e2e` job) and Lighthouse scores (`lighthouse` job, ADR-0012); this audit is the local check and explains failures. Audit the production build, never the dev server.

## Budgets (per page, before gzip)

The byte budgets live in `tests/e2e/support.ts` (source of truth, checked in CI); the table mirrors them.

| What                         | Budget                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------- |
| HTML                         | ≤ 50 KB                                                                           |
| CSS                          | ≤ 20 KB                                                                           |
| JavaScript                   | ≤ 5 KB, inline only; only the scripts allowed in `docs/architecture.md`           |
| Fonts                        | ≤ 150 KB total, `woff2` only, ≤ 2 preloaded                                       |
| Images                       | through Astro `<Image>` with width and height; hero ≤ 150 KB; below the fold lazy |
| Requests to any other origin | 0                                                                                 |
| LCP / CLS                    | ≤ 2.0 s / ≤ 0.05 on the local preview                                             |

## Steps

1. **Build.** `npm run build`. List what shipped: `ls -lR dist` and note the size of each HTML, CSS, JS, font, and image file.
2. **Per-page static checks** for each route in `dist/` (Read or Grep the HTML):
   - `<script` tags: each is on the allowed list and has a justification comment in source. Any external `src=` script, or an `/_astro/*.js` file, needs an explanation.
   - `client:` directives in `src/` (Grep): each has a comment saying why.
   - Preloads (`rel="preload"`): fonts only, at most 2.
   - `<img>`: `width`, `height`, and `loading="lazy"` below the fold; formats are webp or avif; nothing is served much larger than its displayed size.
   - Every `href` and `src` is same-origin (no CDN, font, or analytics hosts).
3. **Browser pass.** Start `npm run preview` in the background and confirm its banner says port 4321 (the browser may only reach 4321, and Astro silently moves to another port if it is taken). If a dev server you started holds the port, stop that background task first; if anything else holds it, ask the user to free it. Never kill processes you did not start. With the Playwright MCP tools, for each route under http://localhost:4321/portfolio/ (port plus `site.base`) at 375 and 1280 px:
   - Navigate, then `browser_evaluate` to collect `performance.getEntriesByType("resource")` (name, `transferSize`, `initiatorType`) and the navigation entry, and read LCP and CLS with a buffered `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`).
   - Check `browser_console_messages` for errors. A blocked request to another origin is a failure: the resource list may not include blocked requests, so the static `href`/`src` scan in step 2 is the real third-party check.
   - Repeat once in the other theme to catch theme-only assets or layout shift from the theme script.
4. **Report** a table per route: each budget, the measured value, ✅ / ❌. Below it, the biggest files and the concrete fix for each failure (subset a font, drop a weight, resize an image, remove a script). Mark **blocker** (over budget) or **should fix**.
5. **Fix** if the user agrees, then rebuild and rerun the affected checks and `npm run verify`.

## Rules

- Never raise a budget to pass. Changing one is a decision: update `tests/e2e/support.ts` and this table together, and say why in the PR.
- Local timings are a rough signal (fast machine, no throttling); byte budgets are the reliable part.
- Stop the preview server you started when done.
