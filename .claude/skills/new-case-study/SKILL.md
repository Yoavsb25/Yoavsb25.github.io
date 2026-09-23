---
name: new-case-study
description: Add a case study to src/content/projects/ in the fixed structure the schema enforces (problem, 3 built, approach, 3 results). Use when the user says "add a case study", "new project", "write up <project>", or /sync-projects proposes a new entry.
---

# /new-case-study: add a project

A case study is a folder, `src/content/projects/<slug>/index.md`, whose frontmatter holds every required section; `src/content.config.ts` validates it (ADR-0005). The home grid, `/projects/<slug>`, and the next-project link update without code changes.

## Steps

1. **Gather facts.** Ask the user, or read the repo README with `gh repo view Yoavsb25/<repo>`. Never invent numbers, dates, users, or clients: leave a field out (if optional) or ask. Mark anything the user has not confirmed with a `# TODO(confirm): <what>` YAML comment.
2. **Pick the slug.** Lowercase kebab-case, short, stable: it becomes the URL and never changes once published. Check `ls src/content/projects/` for clashes.
3. **Write the frontmatter**, copying the shape of `src/content/projects/portfolio/index.md`:
   - `title`, `kicker` (e.g. "Client project", "SysAid · 2025"), `summary` (one sentence), `tags` (1–4), `outcome` (one sentence).
   - `meta`: `role`, `timeline` (optional), `stack` (list), `links` (list of `{label, href}`; omit for private or internal work).
   - `problem`, `built` (exactly 3), `approach`, `results` (exactly 3 `{figure, label}`; the figure is short: "29", "100%", "Sold").
   - `order` (position among projects), `featured` (at most one project), `draft: true` until the user approves the copy.
   - `cover` is optional: `{ src: ./cover.png, alt: "…" }` with the image beside `index.md`.
   - The Markdown body below the frontmatter is an optional deep dive; leave it empty unless the user wants one.
4. **Check the copy.** Dispatch the `content-editor` agent to review it against the voice rules, or follow them yourself (`docs/design-system.md` → Voice).
5. **Verify.** `npm run verify`. A missing field or wrong count fails `astro check` and the build with the exact path.

## Rules

- Content is prose only. The site URL, name, email, and socials come from `src/config/site.ts`, never from content.
- Employer (SysAid) work: only what the user has explicitly approved for public use; no private repositories, clients, or internal names without consent.
- Renumber `order` on other projects if needed so it stays unique.
