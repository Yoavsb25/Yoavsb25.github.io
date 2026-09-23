---
name: sync-projects
description: Compare Yoav's public GitHub repositories with the case studies in src/content/projects/ and propose additions or updates, one at a time, for the user to approve. Use when the user says "sync projects", "what projects am I missing", "update projects from GitHub", or after shipping a new public repo.
---

# /sync-projects: propose case studies from GitHub

GitHub is a source of candidates, not of copy. Nothing is written without the user's approval of that specific entry.

## Steps

1. **List repositories.** `gh repo list Yoavsb25 --limit 100 --json name,description,url,isPrivate,isFork,isArchived,pushedAt,primaryLanguage`. Drop private repos, forks, and archived repos.
2. **List case studies.** Read each `src/content/projects/*/index.md`; match repos by the GitHub URL in `meta.links`.
3. **Classify** each remaining repo:
   - **Linked**: has a case study. Check whether the repo changed meaningfully since (description, new release, `pushedAt`) and whether the case study's stack or links look stale.
   - **Candidate**: public, active, and not linked.
   - **Skip**: coursework, tests, dotfiles, experiments, and the repos below (ask if unsure).

   Decided so far: skip coursework, the wedding site, forks, and earlier portfolio attempts; `claude-code-tools` is a candidate for a later case study; `prenup-ai-knowledge` is private. Update this list when the user decides on a repo.

4. **Report** a short table: repo, class, one-line reason, proposed action. Stop and let the user choose.
5. **Apply one approved item at a time:**
   - New: run `/new-case-study` with the repo as the source, `draft: true`.
   - Update: show the exact frontmatter diff, apply it only after a yes.
6. **Verify.** `npm run verify` after the last change.

## Rules

- Read-only on GitHub: `gh repo list` and `gh repo view` only. Never create, edit, or star repos.
- Never infer metrics, users, clients, or dates from a README; ask.
- Never add or reveal a private repository.
