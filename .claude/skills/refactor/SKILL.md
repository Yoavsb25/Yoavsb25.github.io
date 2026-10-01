---
name: refactor
description: Restructure existing code without changing what it does: split a long function or file, remove duplication, rename, move logic into src/lib/, or simplify. Use when the user says "refactor", "clean up", "simplify", "split this", "extract", "dedupe", or when ESLint size/complexity limits or knip flag code. Not for bug fixes (use /fix-bug) or new behavior.
---

# /refactor: change the structure, never the behavior

A refactor is done when the code is simpler and every observable output is byte-for-byte what it was. If behavior must change, stop: that is a feature or a fix, in its own commit, with the user's approval.

## Steps

1. **Name the target and the reason** in one line: which file or function, and what is wrong with it (over a lint limit, duplicated in N places, logic in a `.astro` file, flagged by knip, hard to test). No reason, no refactor.
2. **Read the code and its callers.** `git grep -n <symbol>` for every export you will touch. List the public surface that must not change: exported names and signatures, rendered HTML, generated files (`sitemap.xml`, `llms.txt`, OG images), CSS class names used by tests.
3. **Pin current behavior first.** Before editing, make sure tests would catch a change:
   - `src/lib/`: run `npm run test:mutation` (about 80 s) and read the survivors for the files you will touch. A surviving mutant in code you are about to move means the tests do not pin it; add a behavior test until it is killed. Commit those tests on their own (`test: pin <thing> before refactor`).
   - Pure output with no good assertion yet: capture it before the change (a throwaway script or test writing JSON to the scratchpad) and compare it byte-for-byte after. Delete the throwaway.
   - Pages and components: the e2e and visual tests are the pin; run `npm run test:e2e` before and after.
4. **Change in small steps.** One move per step (extract, inline, rename, move). After each: `npm run test` (and `npm run lint` for limit-driven work). Red means undo the step, not patch forward.
5. **Keep the layers.** Logic moves toward `src/lib/` with a test; `.astro` files stay presentational; imports follow `docs/architecture.md`. ESLint enforces the layers; a boundary error means the design is wrong, not the rule.
6. **Delete what died.** `npm run knip` must report nothing: remove the old function, export, or file in the same change.
7. **Verify.** `npm run verify`, then `npm run test:mutation` if `src/lib/` changed: the score must not drop below the `break` threshold in `stryker.config.json`, and the touched files must not gain survivors.
8. **Review.** Dispatch the `refactor-reviewer` agent. Fix every behavior-change finding before /ship.
9. **Commit** as `refactor: <what>`; tests added in step 3 go in a `test:` commit before it.

## Never

- Change behavior, public signatures, or output "while you are there". Note it for the user instead.
- Edit, skip, or delete a test to make the refactor pass. A failing pinned test means the refactor changed behavior.
- Add a suppression or raise an ESLint limit, the mutation threshold, or a coverage threshold to make it pass (ADR-0021).
- Refactor code outside the current roadmap PR's scope without asking.
