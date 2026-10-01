# 0021. Make the quality gates tamper-proof

- Status: accepted
- Date: 2026-10-01

## Context

AI tools write and refactor most of this code. The gates (ADR-0004) stopped bad code, but not an agent weakening the gates themselves: `eslint.config.js`, `tsconfig.json`, `vitest.config.ts` (the coverage thresholds from ADR-0019), and the visual baselines (ADR-0018) were not protected. A new lint disable, type-check suppression, coverage ignore, or skipped test also passed every check. The Stop hook ran lint and `astro check` but no tests, so a refactor that broke behavior could still end with "done".

## Decision

- The config that defines what the checks enforce is protected (edits ask first) and under CODEOWNERS: ESLint, TypeScript, Vitest, Playwright, commitlint, Lighthouse, lychee, and Prettier config, `tests/e2e/support.ts`, and `tests/e2e/__screenshots__/`.
- A suppression ratchet: `scripts/guards/check-suppressions.mjs` counts lint disables, `@ts-` suppressions, coverage ignores, and `.only`/`.skip`/`.skipIf`/`.fixme` calls in every source file, and fails when a file has more than `scripts/guards/suppressions.json` approves. Each approved entry records why.
- It is stateless (no diff against `main`), so the same check runs as `npm run guards` first in `verify` (local, pre-push, CI), in pre-commit, and in the Stop hook. Agents other than Claude Code are held to it by CI.
- The baseline file sits in `scripts/guards/`, so raising a count is a protected, owner-reviewed change. There is deliberately no command to regenerate it.
- The Stop hook also runs the unit tests (about a second).

## Consequences

- A genuinely needed suppression needs the owner's approval and a written reason. Removing one prints a reminder to lower the count.
- Counting is textual: a pattern inside a string also counts. Test fixtures build those strings at runtime (see `tests/unit/guards.test.ts`).
- Editing tool config now prompts, even for harmless changes.
- Rejected: requiring a reason comment next to each suppression (an agent just writes one); diffing against `main` (CI checks out a shallow clone, and the result would depend on the base).
