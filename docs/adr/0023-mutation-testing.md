# 0023. Mutation testing on src/lib

- Status: accepted
- Date: 2026-10-01

## Context

`src/lib` has 100% line coverage (ADR-0019), but coverage only proves lines ran, not that a test would notice them being wrong. AI-written tests often assert little (`toContain` where `toBe` was meant). The first mutation run scored 82%: 43 planted bugs survived, including XML escaping in `crawlers.ts` and the JSON-LD `@context`/`@type` values.

## Decision

- **Stryker** (`@stryker-mutator/core`) mutates `src/lib/**/*.ts`; `npm run test:mutation` runs it with `stryker.config.json` named explicitly, so a stray `stryker.conf.*` (which Stryker would load first) has no effect; every Stryker config name is protected (about 80 s).
- It uses Stryker's built-in `command` runner (Vitest per mutant, with coverage off). The Vitest plugin did not switch mutants on under Vitest 5 and reported a false 9%.
- `thresholds.break` is the ratchet: set just under the current score (89 on adoption, 89.7% after adding tests for the real gaps). Raise it as the score rises; lowering it is a protected config change.
- It runs in `ci:local` (pre-push, after `audit`) and as the `mutation` CI job, not in `verify`: too slow for every change. `/refactor` and `/fix-bug` run it when `src/lib/` changes.
- `Stryker disable` comments count as suppressions in the ratchet (ADR-0021).
- `qs` is overridden to 6.16.0: Stryker's `typed-rest-client` pins 6.15.1, which has moderate advisories. It is used only by the dashboard reporter, which this repo does not use. Remove the override once Stryker ships a `typed-rest-client` that allows a patched `qs`.

## Consequences

- The remaining survivors are OG layout style values (asserting them would only pin the design) and one equivalent mutant in `seo.ts` (`absoluteUrl("")` equals `absoluteUrl("/")`). A score below the threshold fails the push and CI.
- A push takes about 80 s longer.
- Running Vitest once per mutant is slower than an in-process runner; revisit the Vitest plugin when it supports Vitest 5.
- Rejected: mutating components or pages (behavior there is covered by e2e and visual tests, and mutants in markup are mostly noise).
