# Portfolio — Claude Code guide

Personal portfolio for an AI engineer. Static Astro site deployed to GitHub Pages. AI is used **locally only** (Claude Code skills, hooks, subagents) — never add API keys, runtime AI, or AI steps in CI.

## Stack

Astro 7 · TypeScript (strictest) · ESLint · Prettier · Vitest · GitHub Actions · GitHub Pages

## Commands

| Command          | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `npm run dev`    | Local dev server at http://localhost:4321                             |
| `npm run verify` | **Definition of Done** — format:check, lint, astro check, test, build |
| `npm run format` | Auto-format everything                                                |
| `npm run test`   | Unit tests (Vitest)                                                   |
| `npm run audit`  | Fail on high/critical dependency vulnerabilities                      |

## Layout

```
src/config/site.ts   single source of truth: site URL, name, socials
src/lib/             pure, unit-tested helpers (no Astro imports)
src/pages/           routes
tests/unit/          Vitest tests, mirror src/lib
docs/                architecture, security, roadmap, ADRs
.claude/settings.json  shared permissions + hook wiring (protected)
.claude/hooks/       Claude Code hook entry scripts (thin wrappers)
scripts/guards/      shared guard rules for Claude + git hooks (protected, tested in tests/unit/guards.test.ts)
.github/workflows/   CI (protected — change only when asked)
```

## Rules

- Work happens one roadmap PR at a time (`docs/roadmap.md`). Stay inside the current PR's scope.
- `npm run verify` must pass before saying work is done.
- Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`…), enforced by commitlint.
- Never push, force-push, or skip hooks (`--no-verify`).
- Site-wide values come from `src/config/site.ts` — never hard-code the URL or name.
- Logic goes in `src/lib/` with a test; `.astro` files stay presentational.
- Ship zero client JS by default. Any `client:*` directive needs a comment justifying it.
- No third-party scripts, trackers, or CDNs (see `docs/security.md`).
- Pin GitHub Actions to full commit SHAs with a version comment.
- A significant decision (new dependency, pattern, or service) needs an ADR in `docs/adr/`.

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

Protected paths (see `scripts/guards/rules.mjs`): `.github/workflows/`, `.github/CODEOWNERS`, `.claude/settings.json`, `.claude/hooks/`, `scripts/guards/`, `package-lock.json`, `lefthook.yml`, `public/CNAME`.

Known limits: `guard-bash` matches command text, so a command that merely mentions a blocked pattern (e.g. in a heredoc) is also denied — write that content with the Write tool instead. Scripts (python, node) that write files are not inspected; CODEOWNERS review is the backstop.
Personal overrides go in `.claude/settings.local.json` (gitignored). Test fake secrets must be built at runtime (see `tests/unit/guards.test.ts`).

## Docs

- `docs/product-brief.md` — goal, audiences, "Hire me" funnel, non-goals (read before any UI or content work)
- `docs/information-architecture.md` — site map and page contents
- `docs/content-inventory.md` — approved copy and data for every section and case study
- `docs/design-system.md` — tokens, type, spacing, motion, components, voice (read before any UI work)
- `docs/design/mockup.html` — approved visual reference
- `docs/architecture.md` — target structure, layers, data flow
- `docs/security.md` — threat model and rules
- `docs/roadmap.md` — PR-by-PR plan and current status
- `docs/adr/` — decision records
