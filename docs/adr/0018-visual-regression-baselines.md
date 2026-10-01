# 0018. Visual regression with Linux baselines

- Status: accepted, amended by 0024
- Date: 2026-09-24

## Context

The design system (`docs/design-system.md`) is detailed, but only `/design-review`, a manual step, checked that pages still match it. A spacing or token change could shift layouts without failing CI. Screenshots differ by OS (font rendering), and full-page shots of the home page are ~690 KB, over the 500 KB staged-file limit (`scripts/guards`).

## Decision

- `tests/e2e/visual.spec.ts` uses Playwright's `toHaveScreenshot` (no new dependency). For every built page and every project (light, dark, iphone) it captures one screenshot per block: site header, each child of `<main>`, footer. Photos (`img`) are masked, the sticky header is made static, and motion is reduced.
- Baselines live in `tests/e2e/__screenshots__/<project>/` and are rendered on Linux only: the spec skips on other platforms, and `snapshotPathTemplate` has no platform suffix.
- Baselines come from CI: a missing baseline is written and the test fails; the `e2e` job uploads `tests/e2e/__screenshots__/` in its failure artifact; the author downloads and commits it. To accept an intended change, delete the affected PNGs and push. Visual tests never retry, so a freshly written baseline cannot pass on a retry.
- Tolerance: `maxDiffPixelRatio: 0.002`, animations disabled.

## Consequences

- Layout and style regressions fail the PR, per section, in both themes and on iPhone WebKit.
- Every intended visual change needs a baseline round trip through CI, and the repo carries ~70 PNGs (each under 500 KB).
- Visual tests do not run on macOS; local runs skip them.
- Rejected: full-page shots (over the size limit); macOS baselines (would not match CI); a hosted service such as Percy or Chromatic (third-party upload, against `docs/security.md`); a separate `workflow_dispatch` update workflow (cannot run before it exists on `main`, and adds a workflow for what the failure artifact already provides).
