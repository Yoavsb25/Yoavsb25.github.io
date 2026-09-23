# 0011. End-to-end and axe checks with Playwright

- Status: accepted
- Date: 2026-09-23

## Context

The product brief asks for WCAG AA in both themes and a small byte budget per page. Unit tests cover `src/lib` only; nothing checked the rendered pages in a browser on every PR. The Playwright MCP (ADR-0009) is for interactive reviews, not CI.

## Decision

- `@playwright/test` and `@axe-core/playwright`, exact-pinned devDependencies. Tests live in `tests/e2e/`, run with `npm run test:e2e` (build, then `astro preview` on port 4322), and run in CI as the `e2e` job.
- Routes are discovered from `dist/`, so every new page is tested without editing the suite.
- Per route, in light and dark (`colorScheme` emulation): HTTP 200, zero axe violations for WCAG 2.0/2.1/2.2 A and AA, no console or page errors.
- Per route, once: the byte budgets in `tests/e2e/support.ts` (HTML, CSS, JS, fonts, woff2 only, preloaded fonts). That file is the source of truth for the budgets; `/perf-audit` reads it.
- `npm run browsers` installs Chromium for both the e2e runner and the MCP server, since each Playwright version prunes browsers it does not know.

## Consequences

- Accessibility and weight regressions fail the PR instead of waiting for a manual audit.
- Two Playwright versions are installed (stable for tests, the MCP's pinned alpha); they need different Chromium builds.
- axe finds roughly a third of WCAG issues; `/a11y-audit` and the `a11y-reviewer` agent still cover keyboard, focus, and reading order.
- Rejected: running axe through the MCP in CI (MCP is an agent tool, not a test runner); pa11y (a second browser stack).
