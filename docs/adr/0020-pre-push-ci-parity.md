# 0020. Run the CI checks before every push

- Status: accepted (ADR-0023 adds mutation testing after `audit`)
- Date: 2026-09-29

## Context

Pre-push ran only `npm run verify`. `audit`, `e2e`, `links`, and `actionlint` first ran in CI, so a push could turn a PR red for a failure a local run would have caught. ADR-0004 promised local and CI results match; they did not.

## Decision

- `npm run ci:local` (`scripts/ci-local.mjs`) runs, in order and stopping at the first failure: `verify`, `audit`, Playwright e2e on the build `verify` made, `stage` + lychee `--offline` (the CI `links` job), and `actionlint`.
- lefthook pre-push runs `ci:local` instead of `verify`. The `/ship` preflight does too.
- `lychee` and `actionlint` are local binaries (`brew install lychee actionlint`), not npm dependencies. The script fails with the install command when either is missing, so the gate never passes silently.
- `scripts/ci-local.mjs` is a protected path: it holds the gate, so weakening it is the same bypass as `--no-verify`.
- `verify` stays the Definition of Done for a single change; `ci:local` is the bar for a push.

## Consequences

- A PR's CI fails only on what cannot run on a Mac: Linux-only visual diffs (ADR-0018), Lighthouse scores (machine-dependent), CodeQL, and `pr-title`.
- A push takes minutes, not seconds. Push less often; do not bypass the hook.
- Local lychee and actionlint versions are not pinned to CI's; a version drift can still differ.
- Rejected: running e2e in Docker for visual parity (needs Docker; a later step if visual diffs keep failing CI); `act` to run the workflows themselves (needs Docker, runner images differ from `ubuntu-latest`).
