---
name: fix-bug
description: Fix a defect test-first. Use when the user reports a bug, something renders or behaves wrong, a check fails unexpectedly, or says "fix", "broken", "doesn't work", "regression", "wrong output". Reproduces it with a failing test, finds the root cause, makes the smallest fix, and keeps the test. Not for restructuring (use /refactor) or new features.
---

# /fix-bug: reproduce, root-cause, smallest fix

The test that reproduces the bug is the deliverable as much as the fix: it stops the bug from coming back.

## Steps

1. **Restate the bug** in one line: expected vs actual, and where (page, route, function, check). If you cannot say what correct looks like, ask the user.
2. **Reproduce it as a failing test**, at the lowest layer that shows it:
   - Wrong value from logic: a unit test in `tests/unit/` against `src/lib/`.
   - Wrong on a page (markup, a11y, layout, bytes): a case in `tests/e2e/` (`npm run test:e2e`).
   - Logic stuck in a `.astro` file: move it to `src/lib/` first (a `/refactor` step, behavior unchanged), then test it there.
     Run it and **watch it fail for the reason in step 1**. A test that passes before the fix proves nothing.
3. **Find the root cause.** Trace the wrong value back to where it is produced, not where it shows. Read `git log -p` for the area: a recent change often explains it. State the cause in one sentence before writing the fix.
4. **Make the smallest fix** at the cause. No refactoring, renaming, or cleanup in the same change; note those for later.
5. **Check the neighbours.** Search for the same mistake elsewhere (`git grep`). Same cause in another place: fix and test it too. Different cause: tell the user.
6. **Verify.** The new test passes; `npm run verify` passes. If `src/lib/` changed, run `npm run test:mutation` and confirm the fixed lines have no surviving mutants.
7. **Commit** as `fix: <what was wrong>`, test and fix together. The body says the cause in one or two lines.

## Never

- Fix without a failing test first, unless the user agrees it cannot be tested (say why).
- Change or delete an existing test to make the fix pass, unless that test asserted the bug; then say so in the commit.
- Silence the symptom: a suppression, a skipped test, a wider threshold, a try/catch that swallows the error (ADR-0021).
- Guess. If two causes are plausible, prove which with a test or a log line before fixing.
