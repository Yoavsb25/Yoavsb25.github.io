# 0004. One verify command, enforced locally and in CI

- Status: accepted
- Date: 2026-09-23

## Context

Standards only hold if the same checks run for every contributor — human or AI — at every stage.

## Decision

`npm run verify` (format, lint with zero warnings, type check, tests, build) is the Definition of Done. It runs in CI on every PR alongside `audit`, `actionlint`, and CodeQL. Locally, lefthook formats/lints staged files and enforces Conventional Commits.

## Consequences

- Local and CI results match; fewer surprises on PRs.
- Slightly slower commits; hooks must not be bypassed.
- Styling approach is deferred to the design-system PR (a new ADR then).
