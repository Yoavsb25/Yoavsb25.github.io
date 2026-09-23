# 0008. Self-hosted fonts and a hashed theme script

- Status: accepted
- Date: 2026-09-23

## Context

The design uses Source Serif 4 and Instrument Sans, plus light and dark themes with a manual toggle. The security model (`docs/security.md`) forbids third-party requests and inline scripts without a CSP hash. A theme chosen by the visitor must apply before first paint, or the page flashes the wrong theme.

## Decision

- Fonts: Astro's built-in `fonts` config with the `fontsource` provider (latin subset, `font-display: swap`). Files are downloaded at build time and served from the site. No Google Fonts requests and no font packages in `package.json`.
- Theme: a tiny inline script in `<head>` reads the saved choice (inside try/catch) and sets `data-theme` before paint. Without a saved choice, CSS follows `prefers-color-scheme`.
- CSP: Astro's built-in `security.csp` emits the `<meta>` policy and computes `script-src` and `style-src` hashes at build, so no hash is maintained by hand. This also covers stylesheets Astro inlines.
- The toggle itself is a small script that stores the choice in `localStorage`.

## Consequences

- No third-party requests; the CSP stays strict (`default-src 'self'`).
- No theme flash on load.
- Font files add ~60–90 KB (cached); preload only the two faces used above the fold.
- Editing the theme script needs no manual step; e2e still checks for CSP violations.
- Alternatives considered: `@fontsource` packages (two extra dependencies for what the fonts API does); a hand-maintained script hash (breaks silently on edit).
