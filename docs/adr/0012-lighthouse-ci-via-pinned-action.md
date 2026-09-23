# 0012. Lighthouse CI through a SHA-pinned action

- Status: accepted
- Date: 2026-09-23

## Context

The product brief targets Lighthouse ≥ 95 performance and 100 accessibility. `@lhci/cli` 0.15.1 as a devDependency adds seven high-severity advisories (via `lighthouse` → `puppeteer-core` → `extract-zip`, which has no fixed release), so `npm run audit` would fail on every PR.

## Decision

- Run Lighthouse CI in the `lighthouse` CI job with `treosh/lighthouse-ci-action`, pinned to a commit SHA. The action commits its `node_modules`, so the pin fixes the whole Lighthouse tree and nothing is fetched from npm at run time.
- `lighthouserc.json` holds the assertions: performance ≥ 0.95, accessibility 1, best practices ≥ 0.95, CLS ≤ 0.05 (errors); SEO 1 and LCP ≤ 2.5 s (warnings until the SEO PR). Three runs per page, every page in `_site/` (`npm run stage`).
- Reports are written to the runner's filesystem and uploaded as a workflow artifact on failure only. Temporary public storage is never used.

## Consequences

- The Lighthouse dependency tree stays out of `package-lock.json` and `npm audit`; Dependabot updates the action pin.
- Lighthouse cannot emulate `prefers-color-scheme`, so scores cover the light theme; axe in `e2e` covers dark-theme contrast.
- No local `lhci` command; `/perf-audit` is the local check.
- Rejected: `@lhci/cli` as a devDependency (audit failures); `npx @lhci/cli@x` in CI (unpinned transitive tree).
