# Contributing

## Setup

```sh
nvm use          # Node version from .nvmrc
npm ci           # also installs git hooks via lefthook
npm run dev
```

## Workflow

1. Pick the next item in `docs/roadmap.md`; one PR per item.
2. Branch from `main`: `<type>/<short-name>` (e.g. `feat/design-system`).
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/). The `commit-msg` hook rejects anything else.
4. Run `npm run verify` before opening the PR.
5. CI must be green (`verify`, `audit`, `actionlint`, `codeql`) before merge.

## Git hooks (lefthook)

- **pre-commit** — secret scan, `.env` block, 500 KB file limit, lockfile-in-sync check, Prettier and ESLint `--fix` on staged files.
- **commit-msg** — commitlint (conventional commits).
- **pre-push** — `npm run verify`.

Do not bypass hooks with `--no-verify`.

## Decisions

Significant decisions get an ADR: copy `docs/adr/0000-template.md` to the next number.

## Using Claude Code

Project rules live in `CLAUDE.md`. Claude Code skills, hooks, and agents live in `.claude/` (added in later roadmap PRs).
