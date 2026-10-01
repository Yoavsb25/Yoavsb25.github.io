# 0022. Dead-code detection and size limits

- Status: accepted
- Date: 2026-10-01

## Context

AI tools refactor freely. Two kinds of rot slip past lint, types, and tests: code left behind by a refactor (unused files, exports, dependencies) and code that grows until no one can review it (long functions, deep nesting, god-files). On adoption, knip found two exports used only inside their own module, and ESLint found one 80-line function in `src/lib/og.ts`.

## Decision

- **knip** (devDependency, `knip.jsonc`) reports unused files, exports, and dependencies, and unlisted dependencies. `npm run knip` runs in `verify`, so in pre-push and CI. Entry points it cannot infer (Claude hooks and skill scripts, launched by Claude Code) and dependencies used outside imports are listed in the config, each with its reason.
- **ESLint limits** on all code: `complexity` 10, `max-depth` 3, `max-params` 4, `max-nested-callbacks` 3, `max-lines` 300, `max-lines-per-function` 60 (blank lines and comments skipped). Tests drop the callback and function-length limits (describe/it nest by design) and allow 500 lines per file.
- Over a limit, the code is split (`/refactor`); a limit is not raised and not suppressed (inline config is off, ADR-0021). `knip.jsonc` is protected like the other check config.

## Consequences

- A refactor that strands code fails `verify` until the code is deleted.
- Long declarative code (the OG element tree) has to be split into named parts. That is the intended pressure, but some splits will feel arbitrary.
- knip needs an ignore entry for each dependency used only through a CLI or config; each one is a protected, reviewed change.
- Rejected: `ts-prune`/`unimported` (archived or narrower than knip); jscpd duplication checks (noisy on Astro markup and CSS; revisit if duplication shows up in review).
