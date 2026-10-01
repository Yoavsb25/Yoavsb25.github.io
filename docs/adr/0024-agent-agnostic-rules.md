# 0024. The same rules for every AI tool

- Status: accepted
- Date: 2026-10-01

## Context

The repo's rules lived in `CLAUDE.md`, and most enforcement before CI came from Claude Code hooks (ADR-0009, ADR-0021). Other agents (Codex, Cursor, Copilot) read `AGENTS.md`, not `CLAUDE.md`, and run no Claude hooks. Some run in the cloud and commit without the git hooks, so the secret scan, `.env` block, file-size limit, and lockfile check (pre-commit only) never ran for their commits. The roadmap also drifted: merged PRs were left 🚧 in progress twice.

## Decision

- **`AGENTS.md` is the source of truth** for every AI tool: stack, commands, layout, rules, protected files, and workflows. `CLAUDE.md` imports it (`@AGENTS.md`, checked by a unit test) and keeps only what Claude Code adds: slash commands, subagents, MCP, and hooks.
- **One rules file.** AI instruction files are protected at any depth (`AGENTS*.md`, `CLAUDE*.md`, `GEMINI.md`, `.cursorrules`, `.windsurfrules`, `copilot-instructions.md`, `.cursor/`), because a nested one overrides the root rules for its folder. The `guards` job fails on any of them other than the root `AGENTS.md` and `CLAUDE.md`. All of `.github/` is protected (composite actions and Dependabot config included).
- **Workflows stay in one place.** The step lists in `.claude/skills/*/SKILL.md` and the review checklists in `.claude/agents/*.md` are plain Markdown; `AGENTS.md` tells other agents to read and follow them, instead of copying them.
- **A `guards` CI job** (`scripts/guards/check-pr.mjs` with `pr-rules.mjs`, pull requests only) runs the commit-time rules over the committed content of every file the PR adds or changes: no `.env` files, no secrets, 500 KB size limit, no control characters in file names, and a lockfile change with any dependency change. It also scans every line any PR commit added, because a secret removed by a later commit stays in the branch history and must be rotated. It lists protected files the PR changes.
- **The job runs the base branch's copy of the guard**, not the PR's, so a PR cannot weaken the check that judges it; changes to the guard take effect after they merge. It uses only Node built-ins, so it installs nothing and runs no PR-controlled code (except in the PR that first adds the guard, when the base has none).
- **Roadmap check** in the same job: at most one row 🚧 in progress, and a branch that is on the roadmap must mark its own row 🚧. Branches not on the roadmap (fixes, Dependabot) pass.
- `npm run ci:local` runs the same script first, so a push finds these failures before CI does.
- The PR template asks which AI tool wrote what, which reviews ran, and why protected files changed.

## Consequences

- Commits made without the git hooks still cannot merge a secret, an `.env` file, an oversized file, or a stale lockfile.
- Rules are edited once, in `AGENTS.md`; `CLAUDE.md` no longer repeats them.
- The guards job cannot tell what a non-Claude agent did before committing (edits to protected files are visible only in the diff). CODEOWNERS does not ask the owner to review their own PRs, so for agent work the owner pushes, reading the diff, guided by the job's protected-files list, is the backstop.
- A secret pushed to a PR branch is already public to anyone who can read the repo; the job reports it so it is rotated, it cannot un-push it.
- Rejected: a diff-size budget (noisy, and lockfiles dominate it); per-tool rule files such as `.cursorrules` (duplication; current tools read `AGENTS.md`).
