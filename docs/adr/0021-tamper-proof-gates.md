# 0021. Make the quality gates tamper-proof

- Status: accepted
- Date: 2026-10-01

## Context

AI tools write and refactor most of this code. The gates (ADR-0004) stopped bad code, but not an agent weakening the gates themselves: `eslint.config.js`, `tsconfig.json`, `vitest.config.ts` (the coverage thresholds from ADR-0019), and the visual baselines (ADR-0018) were not protected. A new lint disable, inline ESLint config, type-check suppression, coverage ignore, or skipped test also passed every check. The Stop hook ran lint and `astro check` but no tests, so a refactor that broke behavior could still end with "done".

## Decision

- **Protected config.** Config that sets what the checks enforce is protected (edits ask first) and under CODEOWNERS, matched by file name at any depth because a nested config overrides the root one: ESLint, Vitest, Playwright, commitlint, and Prettier config, `tsconfig*.json`, `.npmrc`, Lighthouse and lychee config. Also `tests/e2e/support.ts`, `tests/e2e/visual.spec.ts` (per-call screenshot thresholds), and `tests/e2e/__screenshots__/`. The Bash guard asks before `--update-snapshots` and before write commands that name a protected directory with or without its trailing slash.
- **No inline lint config.** ESLint runs with `noInlineConfig` and `reportUnusedDisableDirectives: "error"`, so rules are set in `eslint.config.js` only.
- **Suppression ratchet.** `scripts/guards/check-suppressions.mjs` counts lint disables, `@ts-` pragmas (any case), coverage ignores (`c8`, `v8`, `istanbul`, `node:coverage`), and test modifiers (`.only`, `.skip`, `.skipIf`, `.runIf`, `.fixme`, `.fail(s)`, `.todo`, called, chained, or indexed; `xit`/`xtest`/`xdescribe`) in every file ESLint, TypeScript, or Vitest may load. Each file's count must equal its entry in `scripts/guards/suppressions.json`, so a removed suppression lowers the allowance instead of freeing a slot. An entry without a `why` approves nothing. Listing errors fail the check.
- It is stateless (no diff against `main`), so the same check runs as `npm run guards` first in `verify` (local, pre-push, CI), in pre-commit, and in the Stop hook. Agents other than Claude Code are held to it by CI.
- The baseline file sits in `scripts/guards/`, so changing a count is a protected, owner-reviewed change. There is deliberately no command to regenerate it.
- The Stop hook also runs the unit tests (the whole hook takes about 7 s). It now notices new files in new folders; each step times out at 120 s and counts as a failure, inside a 600 s hook timeout, so the hook is never killed before it reports.

## Consequences

- A genuinely needed suppression needs the owner's approval and a written reason; removing one needs the count lowered in the same PR.
- Counting is textual: a pattern inside a string or comment also counts, and an alias (`const t = test.skip`) is missed. Test fixtures build those strings at runtime (see `tests/unit/guards.test.ts`). CODEOWNERS review is the backstop.
- Pre-commit reads the working tree, not the staged blobs: a partial commit can differ from what was checked. CI checks the committed tree.
- Editing tool config now prompts, even for harmless changes.
- Rejected: requiring a reason comment next to each suppression (an agent just writes one); diffing against `main` (CI checks out a shallow clone, and the result would depend on the base).
