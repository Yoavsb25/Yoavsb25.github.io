# Portfolio — guide for AI coding agents

This file is the source of truth for every AI tool working in this repo (Claude Code, Codex, Cursor, Copilot, and others). `CLAUDE.md` imports it and adds what only Claude Code can enforce (ADR-0024).

Personal portfolio for an AI engineer. Static Astro site deployed to GitHub Pages. AI is used **locally only**: never add API keys, runtime AI, or AI steps in CI.

## Stack

Astro 7 · TypeScript (strictest) · ESLint · Prettier · Vitest · Playwright · Stryker · knip · GitHub Actions · GitHub Pages

## Setup

`npm ci` (also installs the git hooks; do not skip them) and `npm run browsers` for e2e. Node version: `.nvmrc`.

## Commands

| Command                 | Purpose                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Local dev server at http://localhost:4321/ (`site.base`)                                          |
| `npm run verify`        | **Definition of Done** — guards, format:check, lint, knip, astro check, test, build               |
| `npm run format`        | Auto-format everything                                                                            |
| `npm run test`          | Unit tests (Vitest)                                                                               |
| `npm run test:mutation` | Stryker on `src/lib` (~80 s): tests must catch planted bugs; score ≥ `break` threshold (ADR-0023) |
| `npm run knip`          | Unused files, exports, dependencies (ADR-0022)                                                    |
| `npm run test:e2e`      | Build, then Playwright + axe + byte budgets on every page (both themes, iPhone)                   |
| `npm run browsers`      | Install Chromium + WebKit for the e2e runner, Chromium for the MCP                                |
| `npm run guards`        | Suppression ratchet: no new lint/type disables, coverage ignores, skipped tests (ADR-0021)        |
| `npm run audit`         | Fail on high/critical dependency vulnerabilities                                                  |
| `npm run ci:local`      | Pre-push gate: PR guards, verify, audit, mutation, e2e, internal links, actionlint (ADR-0020)     |

## Layout

```
src/config/site.ts   single source of truth: site URL, name, socials
src/content/         site copy: case studies (MD) and YAML, validated by src/content.config.ts
src/lib/             pure, unit-tested helpers (no Astro imports)
src/pages/           routes
tests/unit/          Vitest tests, mirror src/lib
tests/e2e/           Playwright + axe per built page, byte budgets, visual baselines
docs/                product brief, IA, design system, architecture, security, roadmap, ADRs
scripts/guards/      the guard rules every check uses (protected, tested in tests/unit/guards.test.ts)
.claude/skills/      step-by-step workflows (any agent can follow them, see Workflows)
.claude/agents/      review checklists (any agent can apply them)
.github/workflows/   CI (protected — change only when asked)
```

## Rules

- Work happens one roadmap PR at a time (`docs/roadmap.md`). Stay inside the current PR's scope. A roadmap branch marks its own row 🚧 in progress; CI checks it.
- `npm run verify` must pass before saying work is done.
- Conventional commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`…), enforced by commitlint. PR titles too (the repo squash-merges).
- Never push, force-push, merge, or skip hooks (`--no-verify`). The user pushes and merges.
- Never commit on `main`. Branch with `git switch -c <type>/<name> --no-track origin/main`.
- Site-wide values come from `src/config/site.ts` — never hard-code the URL or name. Internal links go through `withBase()` (`src/lib/url.ts`, ADR-0010).
- Logic goes in `src/lib/` with a test; `.astro` files stay presentational. Imports follow the layers in `docs/architecture.md` (ESLint enforces them).
- Size limits (ADR-0022): complexity 10, depth 3, 4 params, 60-line functions, 300-line files. Over a limit, split the code; never raise the limit.
- Refactors and bug fixes follow their workflows below; never mix either with new behavior in one commit.
- Ship zero client JS by default. Any `client:*` directive needs a comment justifying it.
- No third-party scripts, trackers, or CDNs (see `docs/security.md`).
- Pin GitHub Actions to full commit SHAs with a version comment.
- A significant decision (new dependency, pattern, or service) needs an ADR in `docs/adr/`.
- Never commit secrets or `.env*` files. Test fake secrets are built at runtime (see `tests/unit/guards.test.ts`).

## Never weaken a check

- Never add a lint disable, `@ts-` pragma, coverage ignore, `Stryker disable`, or `.only`/`.skip`/`.todo` to make a check pass: `npm run guards` fails on it. Fix the cause, or ask the user to approve it in `scripts/guards/suppressions.json`. Inline ESLint config is disabled.
- **Protected files** — change only when the user explicitly asks (CODEOWNERS review applies; `scripts/guards/rules.mjs` has the full list): `.github/`, `.claude/`, `AGENTS.md`, `CLAUDE.md`, `.mcp.json`, `scripts/guards/`, `scripts/ci-local.mjs`, `package.json`, `package-lock.json`, `lefthook.yml`, `public/CNAME`; check config at any depth (ESLint, Vitest, Playwright, commitlint, Prettier, Stryker, knip, `tsconfig*.json`, `.npmrc`, Lighthouse, lychee); `tests/e2e/support.ts`, `tests/e2e/visual.spec.ts`, `tests/e2e/__screenshots__/` (never `--update-snapshots` unasked).
- A failing test means the code is wrong until proven otherwise: do not edit, skip, or delete it to get green.

## Workflows

Each workflow is a checklist in `.claude/skills/<name>/SKILL.md`. Claude Code runs them as `/name`; any other agent reads the file and follows its steps.

| Workflow         | When                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| `refactor`       | Restructuring code: pin behavior first, small steps, knip clean                      |
| `fix-bug`        | A defect: failing test first, root cause, smallest fix, test kept                    |
| `new-component`  | Adding a component: picks the layer, follows the design-system spec                  |
| `new-page`       | Adding a route that is in the information architecture                               |
| `new-case-study` | Adding a project: the fixed case-study structure the schema enforces                 |
| `adr`            | A significant decision is made or reversed                                           |
| `ship`           | Before calling a PR ready: preflight, scope check, PR title and body. Never pushes   |
| `design-review`  | PRs that change pages, components, or styles: visual check against the design system |
| `a11y-audit`     | Same PRs: accessibility checks in light and dark themes                              |
| `perf-audit`     | PRs that add pages, images, fonts, or scripts: byte budgets and Web Vitals           |

Review checklists live in `.claude/agents/`: `code-reviewer` (any code change), `refactor-reviewer` (refactors), `security-reviewer` (`.github/`, `.claude/`, `scripts/guards/`, dependencies, `<head>`), `a11y-reviewer` (UI), `content-editor` (site copy). Without subagents, apply the checklist yourself to `git diff origin/main...HEAD` before `ship`.

Standard PR flow: plan in scope → build → `npm run verify` → reviews and audits → `ship` → the user pushes, opens the PR, fills the AI section of the template, and merges when green.

## Guardrail layers

One rule set (`scripts/guards/rules.mjs`) enforced at three levels:

1. **Agent hooks** — Claude Code intercepts actions before they happen (`.claude/`, see `CLAUDE.md`). Other tools: follow the rules above; the next two layers still apply.
2. **Git hooks** (`lefthook.yml`, installed by `npm ci`) — every commit: secret scan, file size (500 KB), lockfile sync, suppression ratchet, Prettier, ESLint, commitlint; `npm run ci:local` before push.
3. **GitHub** — CI (`verify`, `guards` over the whole PR diff, `audit`, `mutation`, `e2e`, …), branch protection, CODEOWNERS review, secret scanning. Cannot be bypassed.

## Docs

- `docs/product-brief.md` — goal, audiences, "Hire me" funnel, non-goals (read before any UI or content work)
- `docs/information-architecture.md` — site map and page contents
- `docs/design-system.md` — tokens, type, spacing, motion, components, voice (read before any UI work)
- `docs/architecture.md` — target structure, layers, data flow
- `docs/security.md` — threat model and rules
- `docs/roadmap.md` — PR-by-PR plan and current status
- `docs/adr/` — decision records
