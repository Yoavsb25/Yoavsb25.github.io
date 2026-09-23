# 0016. Sitemap, robots.txt, and llms.txt as our own endpoints

- Status: accepted
- Date: 2026-09-23

## Context

Search engines need a sitemap and robots.txt; `llms.txt` (llmstxt.org) gives language models a plain summary of the site. The site has a handful of pages, and `/styleguide` and draft projects must stay out of the sitemap. `@astrojs/sitemap` would add a dependency and needs a filter to exclude pages.

## Decision

- Static endpoints: `src/pages/sitemap.xml.ts`, `robots.txt.ts`, and `llms.txt.ts`. The text is built by pure, unit-tested helpers in `src/lib/crawlers.ts`; the endpoints load data from `site.ts` and the content collections.
- The sitemap lists indexable pages explicitly. An e2e test fails if it differs from the built pages without a `noindex` meta, so a new page cannot be forgotten.
- The URL is `/sitemap.xml` (a single urlset), not `/sitemap-index.xml`.

## Consequences

- No dependency; each file is a few lines and fully tested.
- Adding a route means adding it to the sitemap list (the e2e test enforces it).
- Rejected: `@astrojs/sitemap`, which is built for large sites and needs configuration to exclude what we exclude by listing.
