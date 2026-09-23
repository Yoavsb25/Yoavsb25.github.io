# 0017. Serve from the user-site repository

- Status: accepted
- Date: 2026-09-24

## Context

ADR-0010 served the site as a project page at `https://yoavsb25.github.io/portfolio/` until a custom domain moved it to the root. The custom domain is deferred. Meanwhile the bare `https://yoavsb25.github.io/` returns 404, and crawlers ignore `robots.txt` (and its sitemap line) because they read it only at the origin root (ADR-0016).

## Decision

- Rename the repository from `portfolio` to `Yoavsb25.github.io`. GitHub Pages serves a repository with that name at the domain root.
- `site.base` in `src/config/site.ts` becomes `"/"`. `withBase()`, `npm run stage`, and the e2e and Lighthouse configs already read it, so nothing else changes in code.
- The rename is done by hand in the repository settings, right before this change merges, so the deploy that follows it builds with the new base.

## Consequences

- The site lives at `https://yoavsb25.github.io/`; `robots.txt` and the sitemap are found by crawlers.
- Old URLs under `/portfolio/` return 404: GitHub Pages cannot redirect them. Accepted because the site had just launched.
- GitHub redirects the old repository URL and git remotes; the repository link in the portfolio case study points to the new name.
- `'self'` in the CSP still covers every GitHub Pages project on the account (same origin); only a custom domain removes that (`docs/security.md`).
- Moving to a custom domain later still needs only `site.url` (and `public/CNAME`); `site.base` stays `"/"`.
- Rejected: a second `Yoavsb25.github.io` repository that only redirects to `/portfolio/` and holds `robots.txt` (another repo to maintain); staying under `/portfolio/` and relying on Search Console (the bare domain stays a 404).
