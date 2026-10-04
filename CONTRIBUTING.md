# Contributing

## Setup

```sh
nvm use          # Node version from .nvmrc
npm ci           # also installs git hooks via lefthook
npm run browsers # Chromium + WebKit for e2e
brew install lychee actionlint  # used by the pre-push hook
npm run dev
```

## Workflow

1. Pick the next item in `docs/roadmap.md`; one PR per item.
2. Branch from `main`: `<type>/<short-name>` (e.g. `feat/design-system`).
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook rejects anything else.
4. Run `npm run verify` while working; the pre-push hook runs `npm run ci:local` (every CI check that runs on a Mac, ADR-0020).
5. Give the PR a Conventional Commit title (`gh pr create --title "feat: …"`, not the branch-name default): the repo squash-merges, so it becomes the commit on `main`. The `pr-title` check enforces it.
6. CI must be green (`verify`, `audit`, `e2e`, `lighthouse`, `links`, `actionlint`, `codeql`, `pr-title`) before merge.

## Visual baselines

Screenshots in `tests/e2e/__screenshots__/` are rendered on Linux in CI (ADR-0018), so visual tests skip on macOS. After an intended visual change, delete the affected PNGs (or the project folder) and push: the `e2e` job fails, and its `playwright-report` artifact contains the new baselines under `tests/e2e/__screenshots__/`. Review them, commit them, and push again. An unintended diff shows up in the same artifact's HTML report.

## Git hooks (lefthook)

- **pre-commit** — secret scan, `.env` block, 500 KB file limit, lockfile-in-sync check, Prettier and ESLint `--fix` on staged files.
- **commit-msg** — commitlint (conventional commits).
- **pre-push** — `npm run ci:local`: verify, audit, mutation testing, e2e, internal links, actionlint. Visual diffs, Lighthouse, CodeQL, and `pr-title` run only in CI.

Do not bypass hooks with `--no-verify`.

AI coding agents follow `AGENTS.md` (Claude Code also reads `CLAUDE.md`, which imports it). The `guards` CI job re-runs the commit-time checks (secrets, `.env` files, file size, lockfile sync) and the roadmap check over the whole PR diff, so they hold for commits made without the git hooks (ADR-0024).

New lint disables, `@ts-` suppressions, coverage ignores, and skipped or focused tests fail `npm run guards` (part of `verify`). If one is truly needed, raise that file's count in `scripts/guards/suppressions.json` with a `why`; the owner reviews it. Removing one means lowering the count in the same PR (ADR-0021).

## Decisions

Significant decisions get an ADR: copy `docs/adr/0000-template.md` to the next number.

## Using Claude Code

Project rules live in `CLAUDE.md`. Claude Code skills, hooks, and agents live in `.claude/`; the hooks share their rules with the git hooks through `scripts/guards/`. See the workflow and guardrail sections of `CLAUDE.md`.
