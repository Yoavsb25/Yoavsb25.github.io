# Portfolio — Claude Code guide

@AGENTS.md

Everything above applies. This file adds what only Claude Code has: skills as slash commands, subagents, the Playwright MCP server, and hooks that enforce the rules before an action happens.

## Skills and agents

Run the workflows in `AGENTS.md` as `/name` (`/refactor`, `/fix-bug`, `/new-component`, `/new-page`, `/new-case-study`, `/adr`, `/ship`, `/design-review`, `/a11y-audit`, `/perf-audit`, `/sync-projects`). `/sync-projects` proposes case studies from public GitHub repos; the user approves each one.

| Agent               | When                                                                              |
| ------------------- | --------------------------------------------------------------------------------- |
| `code-reviewer`     | Before `/ship` on any PR that changes code                                        |
| `refactor-reviewer` | After `/refactor`: checks behavior, public API, and tests are unchanged           |
| `security-reviewer` | PRs touching `.github/`, `.claude/`, `scripts/guards/`, dependencies, or `<head>` |
| `a11y-reviewer`     | PRs that change pages, components, or styles (needs `npm run dev`)                |
| `content-editor`    | Writing or editing site copy in `src/content/`                                    |

The Playwright MCP server (`.mcp.json`, pinned devDependency) drives a headless, isolated browser limited to `http://localhost:4321` for the a11y, design, and perf reviews; artifacts go to `.playwright-mcp/` (gitignored).

## Claude Code hooks (enforced automatically)

| When              | Hook                      | Effect                                                                                                                                                                                                    |
| ----------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session start     | `session-context.mjs`     | Injects branch, uncommitted changes, current roadmap PR                                                                                                                                                   |
| Before Edit/Write | `guard-protected.mjs`     | Denies edits on `main`; asks before editing protected paths; denies `.env*`                                                                                                                               |
| Before Edit/Write | `scan-secrets.mjs`        | Denies content that looks like an API key, token, or private key                                                                                                                                          |
| Before Bash       | `guard-bash.mjs`          | Denies push, `--no-verify`, hard reset, recursive force delete, global installs, piping downloads to a shell, commits on `main`; asks before commands that modify protected paths or `--update-snapshots` |
| After Edit/Write  | `format-file.mjs`         | Prettier + ESLint `--fix` on the file; reports remaining lint errors                                                                                                                                      |
| After Bash        | `dependency-reminder.mjs` | After `npm install <pkg>`, reminds that new dependencies need an ADR                                                                                                                                      |
| Before stopping   | `quick-check.mjs`         | If source changed, runs guards, lint, `astro check`, unit tests; failures must be fixed                                                                                                                   |

Protected paths are matched resolved and case-insensitive (`scripts/guards/rules.mjs`); `.claude/settings.local.json` is protected too.

Agent boundaries are enforced by the global guard hooks using the subagent's `agent_type` (ADR-0009): reviewers get one plain read-only command at a time, `a11y-reviewer` has no shell, `content-editor` writes only site copy. Guard hooks fail closed.

Known limits: `guard-bash` matches command text, so a command that merely mentions a blocked pattern (e.g. in a heredoc) is also denied — write that content with the Write tool instead. Scripts (python, node) that write files are not inspected; CODEOWNERS review and the CI `guards` job are the backstop.
Personal overrides go in `.claude/settings.local.json` (gitignored).
