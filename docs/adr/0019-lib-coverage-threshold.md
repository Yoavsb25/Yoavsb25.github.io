# 0019. Coverage threshold on src/lib

- Status: accepted
- Date: 2026-09-24

## Context

`CLAUDE.md` puts all logic in `src/lib/` with a test, but nothing measured it: a new helper could ship with a branch no test reaches. `src/lib` is pure TypeScript and was already at 100% lines and 97.7% branches.

## Decision

- Add `@vitest/coverage-v8` (devDependency, same version as `vitest`).
- `vitest.config.ts` enables coverage on every run, scoped to `src/lib/**`, with thresholds: lines, functions, statements 100%; branches 95%. `npm run test` (and so `verify`, CI, and pre-push) fails below them. The report is a one-block text summary; no files are written.

## Consequences

- Untested logic in `src/lib` fails verify, which keeps the "logic in lib, with a test" rule honest.
- Branches are held at 95%, not 100%, so a defensive `??` fallback does not force a contrived test.
- Components and pages are not measured; e2e and axe cover them.
- Rejected: coverage over all of `src/` (`.astro` files are not meaningfully measured by v8 in unit tests); Istanbul provider (slower, instruments the source).
