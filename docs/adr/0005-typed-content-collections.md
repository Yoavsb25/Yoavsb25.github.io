# 0005. Content in typed collections, in the repo

- Status: accepted
- Date: 2026-09-23

## Context

Content (case studies, experience, profile) must be easy to update by hand or with a Claude skill, reviewed like code, and impossible to publish malformed. A headless CMS would add an external service and an auth surface.

## Decision

Store content as MDX (case studies) and YAML (experience, profile) under `src/content/`, validated by Astro content collections with zod schemas in `src/content.config.ts`. Case studies have required sections enforced by schema and layout.

## Consequences

- Content changes go through PRs and CI; a missing field fails the build.
- Claude skills can generate content that is verified automatically.
- Editing requires git (acceptable: single author).
