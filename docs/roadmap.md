# Roadmap

One PR at a time; the next starts only after the previous is merged.

| #   | Branch                        | Scope                                                                     | Status         |
| --- | ----------------------------- | ------------------------------------------------------------------------- | -------------- |
| 1   | `chore/scaffold`              | Astro + TS strict, ESLint, Prettier, Vitest, `npm run verify`             | ✅ merged      |
| 2   | `ci/pr-checks`                | CI (verify, audit, actionlint, CodeQL), Dependabot, templates             | ✅ merged      |
| 3   | `chore/guardrails`            | lefthook, commitlint, CONTRIBUTING, CLAUDE.md, docs, ADRs                 | 🚧 in progress |
| 4   | `chore/claude-settings-hooks` | `.claude/settings.json` permissions + hook scripts                        | ⏳             |
| 5   | `chore/claude-skills-core`    | `/adr`, `/ship`, `/new-component`, `/new-page`                            | ⏳             |
| 6   | `chore/claude-agents-mcp`     | Subagents, Playwright MCP, `/design-review`, `/a11y-audit`, `/perf-audit` | ⏳             |
| 7   | `ci/deploy`                   | Deploy to Pages, e2e + axe, Lighthouse, link check                        | ⏳             |
| 8   | `feat/design-system`          | `/design-options` → tokens, design doc, UI primitives                     | ⏳             |
| 9   | `feat/content-model`          | Content collections, `/new-case-study`, `/new-post`, `/sync-projects`     | ⏳             |
| 10  | `feat/layout-seo`             | BaseLayout, CSP, SEO/JSON-LD, OG images, sitemap, RSS, `llms.txt`         | ⏳             |
| 11  | `feat/pages`                  | Home, Projects, About, Writing, 404                                       | ⏳             |
| 12  | `chore/launch`                | Custom domain, final audits, `v1.0.0`                                     | ⏳             |
