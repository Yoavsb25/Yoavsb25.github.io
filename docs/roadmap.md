# Roadmap

One PR at a time; the next starts only after the previous is merged.

| #   | Branch                         | Scope                                                                                                                | Status    |
| --- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | `chore/scaffold`               | Astro + TS strict, ESLint, Prettier, Vitest, `npm run verify`                                                        | ✅ merged |
| 2   | `ci/pr-checks`                 | CI (verify, audit, actionlint, CodeQL), Dependabot, templates                                                        | ✅ merged |
| 3   | `chore/guardrails`             | lefthook, commitlint, CONTRIBUTING, CLAUDE.md, docs, ADRs                                                            | ✅ merged |
| 4   | `chore/claude-settings-hooks`  | Claude permissions + hooks, shared guard rules, CODEOWNERS                                                           | ✅ merged |
| 5   | `docs/product-plan`            | Product brief, IA, content inventory (real copy and data), architecture, design system, ADR-0005 to 0008, mockup     | ✅ merged |
| 6   | `chore/claude-skills-agents`   | `/adr`, `/ship` skills, 4 review/content subagents, Playwright MCP                                                   | ✅ merged |
| 7   | `feat/design-system`           | Tokens, self-hosted fonts, `ui/` primitives, site chrome, BaseLayout, theme toggle, ESLint boundaries, `/styleguide` | ✅ merged |
| 8   | `chore/claude-skills-scaffold` | `/new-component`, `/new-page`, `/design-review`, `/a11y-audit`, `/perf-audit`                                        | ⏳        |
| 9   | `ci/deploy`                    | Deploy to Pages, e2e + axe, Lighthouse budgets, link check                                                           | ⏳        |
| 10  | `feat/content-model`           | Content collections + schemas, `/new-case-study`, `/sync-projects`; delete `content-inventory.md`                    | ⏳        |
| 11  | `feat/seo`                     | SEO/JSON-LD, CSP, OG images, sitemap, robots, `llms.txt`                                                             | ⏳        |
| 12  | `feat/pages`                   | Home (hero, how I work, work, resume, contact), case study pages, 404; delete `docs/design/mockup.html`              | ⏳        |
| 13  | `content/launch-content`       | Real case studies, experience, CV                                                                                    | ⏳        |
| 14  | `chore/launch`                 | Custom domain, final audits, `v1.0.0`                                                                                | ⏳        |

Phase 2 (after launch): writing/blog, `/new-post` skill, RSS.
