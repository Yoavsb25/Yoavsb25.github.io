# Portfolio — Claude Code guide

Personal portfolio for an AI engineer. Static Astro site deployed to GitHub Pages. AI is used **locally only** (Claude Code skills, hooks, subagents) — never add API keys, runtime AI, or AI steps in CI.

## Stack

Astro 7 · TypeScript (strictest) · ESLint · Prettier · Vitest · GitHub Actions · GitHub Pages

## Commands

| Command            | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `npm run dev`      | Local dev server at http://localhost:4321/portfolio/ (`site.base`)      |
| `npm run verify`   | **Definition of Done** — format:check, lint, astro check, test, build   |
| `npm run format`   | Auto-format everything                                                  |
| `npm run test`     | Unit tests (Vitest)                                                     |
| `npm run test:e2e` | Build, then Playwright + axe + byte budgets on every page (both themes) |
| `npm run browsers` | Install Chromium for the e2e runner and the Playwright MCP              |
| `npm run audit`    | Fail on high/critical dependency vulnerabilities                        |

## Layout

```
src/config/site.ts   single source of truth: site URL, name, socials
src/content/         site copy: case studies (MD) and YAML, validated by src/content.config.ts
src/lib/             pure, unit-tested helpers (no Astro imports)
src/pages/           routes
tests/unit/          Vitest tests, mirror src/lib
tests/e2e/           Playwright + axe per built page, byte budgets
docs/                architecture, security, roadmap, ADRs
.claude/settings.json  shared permissions + hook wiring (protected)
.claude/hooks/       Claude Code hook entry scripts (thin wrappers)
.claude/skills/      project skills (/adr, /ship, /new-*, /sync-projects, audits)
.claude/agents/      review and content subagents
.mcp.json            project MCP servers (Playwright, pinned)
scripts/guards/      shared guard rules for Claude + git hooks (protected, tested in tests/unit/guards.test.ts)
.github/workflows/   CI (protected — change only when asked)
```

## Rules

- Work happens one roadmap PR at a time (`docs/roadmap.md`). Stay inside the current PR's scope.
- `npm run verify` must pass before saying work is done.
- Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`…), enforced by commitlint.
- Never push, force-push, or skip hooks (`--no-verify`).
- Site-wide values come from `src/config/site.ts` — never hard-code the URL or name. Internal links go through `withBase()` (`src/lib/url.ts`, ADR-0010).
- Logic goes in `src/lib/` with a test; `.astro` files stay presentational.
- Ship zero client JS by default. Any `client:*` directive needs a comment justifying it.
- No third-party scripts, trackers, or CDNs (see `docs/security.md`).
- Pin GitHub Actions to full commit SHAs with a version comment.
- A significant decision (new dependency, pattern, or service) needs an ADR in `docs/adr/`.

## Workflow: skills and agents

| Use                       | When                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `/adr`                    | A significant decision is made or reversed                                                |
| `/ship`                   | Before calling a PR ready: preflight checks, scope check, PR title and body. Never pushes |
| `/new-component`          | Adding a component: picks the layer, follows the design-system spec                       |
| `/new-page`               | Adding a route that is in the information architecture                                    |
| `/design-review`          | PRs that change pages, components, or styles: visual check against the design system      |
| `/a11y-audit`             | Same PRs: static scan, then dispatches the `a11y-reviewer` agent, then triage             |
| `/perf-audit`             | PRs that add pages, images, fonts, or scripts: byte budgets and Web Vitals on the build   |
| `code-reviewer` agent     | Before `/ship` on any PR that changes code                                                |
| `security-reviewer` agent | PRs touching `.github/`, `.claude/`, `scripts/guards/`, dependencies, or `<head>`         |
| `a11y-reviewer` agent     | PRs that change pages, components, or styles (needs `npm run dev`)                        |
| `content-editor` agent    | Writing or editing site copy in `src/content/`                                            |
| `/new-case-study`         | Adding a project: the fixed case-study structure the schema enforces                      |
| `/sync-projects`          | Proposing case studies from public GitHub repos; the user approves each one               |

Standard PR flow: plan in scope → build → `npm run verify` → review agents and audits → `/ship` → the user pushes, opens the PR, merges when green.

The Playwright MCP server (`.mcp.json`, pinned devDependency) drives a headless, isolated browser limited to `http://localhost:4321` for the a11y, design, and perf reviews; artifacts go to `.playwright-mcp/` (gitignored). First-time setup: `npm ci && npm run browsers`.

## Guardrail layers

One rule set (`scripts/guards/rules.mjs`) enforced at three levels:

1. **Claude hooks** (`.claude/`) — intercept the agent's actions _before_ they happen.
2. **Git hooks** (`lefthook.yml`) — every commit by anyone: secret scan, file size (500 KB), lockfile sync, Prettier, ESLint, commitlint; `npm run verify` before push.
3. **GitHub** — CI checks, branch protection, CODEOWNERS review, secret scanning. Cannot be bypassed.

## Claude Code hooks (enforced automatically)

| When              | Hook                      | Effect                                                                                                                                                                            |
| ----------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session start     | `session-context.mjs`     | Injects branch, uncommitted changes, current roadmap PR                                                                                                                           |
| Before Edit/Write | `guard-protected.mjs`     | Denies edits on `main`; asks before editing protected paths; denies `.env*`                                                                                                       |
| Before Edit/Write | `scan-secrets.mjs`        | Denies content that looks like an API key, token, or private key                                                                                                                  |
| Before Bash       | `guard-bash.mjs`          | Denies push, `--no-verify`, hard reset, recursive force delete, global installs, piping downloads to a shell, commits on `main`; asks before commands that modify protected paths |
| After Edit/Write  | `format-file.mjs`         | Prettier + ESLint `--fix` on the file; reports remaining lint errors                                                                                                              |
| After Bash        | `dependency-reminder.mjs` | After `npm install <pkg>`, reminds that new dependencies need an ADR                                                                                                              |
| Before stopping   | `quick-check.mjs`         | If source changed, runs lint + `astro check`; failures must be fixed                                                                                                              |

Protected paths (see `scripts/guards/rules.mjs`, resolved and case-insensitive): `.github/workflows/`, `.github/CODEOWNERS`, `.claude/` (all of it, including `settings.local.json`), `CLAUDE.md`, `.mcp.json`, `scripts/guards/`, `package.json`, `package-lock.json`, `lefthook.yml`, `public/CNAME`.

Agent boundaries are enforced by the global guard hooks using the subagent's `agent_type` (ADR-0009): reviewers get one plain read-only command at a time, `a11y-reviewer` has no shell, `content-editor` writes only site copy. Guard hooks fail closed.

Known limits: `guard-bash` matches command text, so a command that merely mentions a blocked pattern (e.g. in a heredoc) is also denied — write that content with the Write tool instead. Scripts (python, node) that write files are not inspected; CODEOWNERS review is the backstop.
Personal overrides go in `.claude/settings.local.json` (gitignored). Test fake secrets must be built at runtime (see `tests/unit/guards.test.ts`).

## Docs

- `docs/product-brief.md` — goal, audiences, "Hire me" funnel, non-goals (read before any UI or content work)
- `docs/information-architecture.md` — site map and page contents
- `docs/design-system.md` — tokens, type, spacing, motion, components, voice (read before any UI work)
- `docs/design/mockup.html` — approved visual reference (frozen; removed in `feat/pages`; its Google Fonts links are not a pattern to copy)
- `docs/architecture.md` — target structure, layers, data flow
- `docs/security.md` — threat model and rules
- `docs/roadmap.md` — PR-by-PR plan and current status
- `docs/adr/` — decision records
