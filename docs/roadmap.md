# Roadmap

One PR at a time; the next starts only after the previous is merged.

| #   | Branch                         | Scope                                                                                          | Status         |
| --- | ------------------------------ | ---------------------------------------------------------------------------------------------- | -------------- |
| 1   | `chore/scaffold`               | Astro + TS strict, ESLint, Prettier, Vitest, `npm run verify`                                  | ✅ merged      |
| 2   | `ci/pr-checks`                 | CI (verify, audit, actionlint, CodeQL), Dependabot, templates                                  | ✅ merged      |
| 3   | `chore/guardrails`             | lefthook, commitlint, CONTRIBUTING, CLAUDE.md, docs, ADRs                                      | ✅ merged      |
| 4   | `chore/claude-settings-hooks`  | Claude permissions + hooks, shared guard rules, CODEOWNERS                                     | ✅ merged      |
| 5   | `docs/product-plan`            | Product brief, information architecture, content inventory, target architecture, ADR-0005/0006 | 🚧 in progress |
| 6   | `docs/design-direction`        | 3 bold design directions → pick one → `docs/design-system.md`, styling ADR                     | ⏳             |
| 7   | `chore/claude-skills-agents`   | `/adr`, `/ship` skills, subagents, Playwright MCP                                              | ⏳             |
| 8   | `feat/design-system`           | Tokens, fonts, `ui/` primitives, layout shell (Header, Footer, BaseLayout)                     | ⏳             |
| 9   | `chore/claude-skills-scaffold` | `/new-component`, `/new-page`, `/design-review`, `/a11y-audit`, `/perf-audit`                  | ⏳             |
| 10  | `ci/deploy`                    | Deploy to Pages, e2e + axe, Lighthouse budgets, link check                                     | ⏳             |
| 11  | `feat/content-model`           | Content collections + schemas, `/new-case-study`, `/sync-projects`                             | ⏳             |
| 12  | `feat/seo`                     | SEO/JSON-LD, CSP, OG images, sitemap, robots, `llms.txt`                                       | ⏳             |
| 13  | `feat/pages`                   | Home, Projects, Case study, About, Contact, 404                                                | ⏳             |
| 14  | `content/launch-content`       | Real case studies, experience, CV                                                              | ⏳             |
| 15  | `chore/launch`                 | Custom domain, final audits, `v1.0.0`                                                          | ⏳             |

Phase 2 (after launch): writing/blog, `/new-post` skill, RSS.
