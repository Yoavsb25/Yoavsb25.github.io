---
name: ship
description: Pre-PR gate for this repo. Use before saying a roadmap PR is ready, or when the user says "ship", "ready for PR", "open a PR", "is this ready to merge", or "what's left before merge". Checks branch, commits, verify, sync with main, and whether everything is pushed, then drafts the PR title and body. Never pushes.
---

# /ship: get a PR ready

The goal is that what gets merged is exactly what was reviewed and verified. This skill never pushes or merges; the user does both.

## Steps

1. **Run the preflight script:**

   ```sh
   node .claude/skills/ship/preflight.mjs
   ```

   It checks, and prints ✅ / ❌ for each:
   - on a feature branch, not `main`
   - working tree clean (everything committed)
   - branch contains the latest `origin/main` (after `git fetch`)
   - all commit messages follow Conventional Commits
   - every local commit is pushed to the branch's upstream (no upstream is reported, not failed)
   - `npm run verify` passes

2. **Fix what failed**, within the current PR's scope:
   - Uncommitted changes: commit them (conventional message) or ask the user if they belong to this PR.
   - Behind `origin/main`: `git rebase origin/main`, resolve conflicts, rerun verify. Tell the user a force-push of the branch will be needed.
   - Verify failing: fix the cause; never weaken a check to pass.
   - Not pushed: tell the user to push; do not push.
     Then rerun the preflight until every line is ✅ except "pushed".

3. **Check scope.** Compare `git diff --stat origin/main...HEAD` with the current roadmap row in `docs/roadmap.md`. Flag files outside the PR's scope.

4. **Update the roadmap** row for this PR if its scope changed, and make sure it says `🚧 in progress`.

5. **Draft the PR** and show it to the user:
   - **Title**: a Conventional Commit, e.g. `feat: add design system tokens and primitives`. The repo squash-merges, so this title becomes the commit on `main`.
   - **Body**: fill `.github/pull_request_template.md`: What (1–2 sentences), How to verify (commands or steps), checklist.
   - The exact commands for the user:
     ```sh
     git push -u origin <branch>
     gh pr create --title "<title>" --body-file <file>
     ```

6. **Remind before merge:** merge only when CI is green and `git status` says the branch is up to date with its upstream, so nothing unpushed is left behind.
