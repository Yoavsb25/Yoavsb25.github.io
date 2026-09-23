# 0010. Pages deploy under a base path

- Status: accepted
- Date: 2026-09-23

## Context

ADR-0002 deploys to GitHub Pages. The repository is `portfolio`, so Pages serves it as a project page at `https://yoavsb25.github.io/portfolio/`, not at the domain root. Root-relative links (`/`, `/#contact`, `/favicon.svg`) break under that prefix. The custom domain (roadmap row 14) will move the site back to the root.

## Decision

- `site.base` in `src/config/site.ts` holds the path the site is served under (`"/portfolio"` now, `"/"` on a custom domain). `astro.config.mjs` reads it as `base`, so Astro prefixes its own assets.
- Every hand-written internal link goes through `withBase()` from `src/lib/url.ts`. `ui/` primitives cannot import `lib/`, so callers pass already-prefixed hrefs.
- `.github/workflows/deploy.yml` runs on every push to `main` (and manually): `npm run verify`, then `actions/upload-pages-artifact` and `actions/deploy-pages`. Only the deploy job gets `pages: write` and `id-token: write`. Deploys queue and are never cancelled midway.
- `npm run stage` copies `dist/` to `_site/<base>/` so static checks (Lighthouse, lychee) see the same URL layout as Pages.

## Consequences

- One value switches the site between project page and custom domain.
- A root-relative link written without `withBase()` points outside the site; the link check in CI catches it.
- The repository's Pages source must be set to "GitHub Actions" once, by hand.
- Rejected: renaming the repository to `yoavsb25.github.io` (no base path, but gives up the repo name); pulling the custom domain forward (needs a domain and DNS now).
