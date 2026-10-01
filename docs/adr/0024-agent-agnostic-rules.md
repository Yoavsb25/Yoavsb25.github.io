# 0024. The same rules for every AI tool

- Status: accepted
- Date: 2026-10-01

## Context

The repo's rules lived in `CLAUDE.md`, and most enforcement before CI came from Claude Code hooks (ADR-0009, ADR-0021). Other agents (Codex, Cursor, Copilot) read `AGENTS.md`, not `CLAUDE.md`, and run no Claude hooks. Some run in the cloud and commit without the git hooks, so the secret scan, `.env` block, file-size limit, and lockfile check (pre-commit only) never ran for their commits. The roadmap also drifted: merged PRs were left 🚧 in progress twice.

## Decision

- **`AGENTS.md` is the source of truth** for every AI tool: stack, commands, layout, rules, protected files, and workflows. `CLAUDE.md` imports it (`@AGENTS.md`) and keeps only what Claude Code adds: slash commands, subagents, MCP, and hooks. `AGENTS.md` is protected and under CODEOWNERS.
- **Workflows stay in one place.** The step lists in `.claude/skills/*/SKILL.md` and the review checklists in `.claude/agents/*.md` are plain Markdown; `AGENTS.md` tells other agents to read and follow them, instead of copying them.
- **A `guards` CI job** (`scripts/guards/check-pr.mjs`, pull requests only) runs the commit-time rules over every file the PR adds or changes: no `.env` files, no secrets, 500 KB size limit, and a lockfile change with any dependency change. It lists protected files the PR changes. It uses only Node built-ins, so it installs nothing and runs no PR-controlled npm scripts.
- **Roadmap check** in the same job: at most one row 🚧 in progress, and a branch that is on the roadmap must mark its own row 🚧. Branches not on the roadmap (fixes, Dependabot) pass.
- `npm run ci:local` runs the same script first, so a push finds these failures before CI does.
- The PR template asks which AI tool wrote what, which reviews ran, and why protected files changed.

## Consequences

- Commits made without the git hooks still cannot merge a secret, an `.env` file, an oversized file, or a stale lockfile.
- Rules are edited once, in `AGENTS.md`; `CLAUDE.md` no longer repeats them.
- The guards job cannot tell what a non-Claude agent did before committing (edits to protected files are visible only in the diff); CODEOWNERS review stays the backstop.
- Rejected: a diff-size budget (noisy, and lockfiles dominate it); per-tool rule files such as `.cursorrules` (duplication; current tools read `AGENTS.md`).
