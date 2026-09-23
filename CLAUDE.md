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

## Docs

- `docs/architecture.md` — structure and data flow
- `docs/security.md` — threat model and rules
- `docs/roadmap.md` — PR-by-PR plan and current status
- `docs/adr/` — decision records
