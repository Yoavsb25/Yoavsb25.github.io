# 0024. Isolated visual blocks and one-command baseline updates

- Status: accepted
- Date: 2026-10-01

## Context

PR #34 changed one card and one case-study header. CI failed 30 screenshots: 15 for the sections it changed, and 15 footers and an iPhone resume block that had not changed. The pages above them grew by a fraction of a pixel, so each footer started on a fractional row and rendered 71 px tall instead of 72; a size mismatch fails whatever the pixel tolerance. Accepting the change took the manual ADR-0018 round trip: CI run, download the artifact, dig the actual images out of the HTML report, commit. Then the push ran every check and was rejected, because GitHub's "Update branch" had moved the remote.

## Decision

- `tests/e2e/visual.spec.ts` hides every other block before screenshotting one, so a block's position never depends on another's height. A visual change fails only the blocks it touches.
- `npm run baselines:pull` (`scripts/pull-baselines.mjs`) finds the failed CI run for HEAD with `gh`, reads the Playwright HTML report from its `playwright-report` artifact, and copies each failed screenshot's actual image over its baseline. It refuses when the run is for another commit, still running, or passed, and when the failure has no screenshots. Parsing is pure and tested (`scripts/lib/report.mjs`), and skips any name that could write outside `tests/e2e/__screenshots__/<project>/`.
- The guard asks before `baselines:pull` runs, as it does for `--update-snapshots`.
- `ci:local` fetches the branch's remote first and stops if it is behind, naming the merge to run. It skips the check on a detached HEAD, where `origin/HEAD` is `main`.
- Amends ADR-0018: accepting a visual change is now push with a PR open (CI runs on pull requests) → CI fails → `npm run baselines:pull` → look → commit → push.

## Consequences

- A section's screenshot no longer shows its spacing to its neighbors; the page-level e2e checks and `/design-review` cover that.
- `gh` (signed in) and `unzip` are local tools for baseline updates, outside npm, like `lychee` and `actionlint`.
- CI still fails once per intended visual change; Linux rendering is still CI-only.
- `ci:local` needs the network for its first step; offline, it skips the check with a note.
- Rejected: Playwright in Docker for local Linux baselines (no Docker on the dev machine; a later step if the CI round trip becomes the bottleneck); a `workflow_dispatch` job that commits baselines (gives CI write access to branches); a larger pixel tolerance (cannot absorb a size change).
