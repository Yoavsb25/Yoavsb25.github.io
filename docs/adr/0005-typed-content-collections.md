# 0005. Content in typed collections, in the repo

- Status: accepted
- Date: 2026-09-23

## Context

Content (case studies, experience, profile) must be easy to update by hand or with a Claude skill, reviewed like code, and impossible to publish malformed. A headless CMS would add an external service and an auth surface.

## Decision

Store content as MDX (case studies) and YAML (experience, stages, profile) under `src/content/`, validated by Astro content collections with zod schemas in `src/content.config.ts`.

- A case study is a folder (`projects/<slug>/index.mdx` plus its images). Its required sections are frontmatter fields, so zod enforces them: `problem`, `built` (exactly 3), `approach`, `results` (exactly 3, each a figure and a label), `meta`, and `order` / `featured` / `draft`. `CaseStudyLayout` renders them; the MDX body is an optional deep dive.
- Content holds prose only. Facts that code depends on (URL, name, email, socials) stay in `src/config/site.ts`.

## Consequences

- Content changes go through PRs and CI; a missing field or wrong count fails the build.
- Home ordering and the next-project link come from `order`, not file order.
- Structured frontmatter reads less like prose than a free MDX body (accepted: every case study has the same shape).
- Claude skills can generate content that is verified automatically.
- Editing requires git (acceptable: single author).
