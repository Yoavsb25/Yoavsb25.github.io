# 0008. Self-hosted fonts and a hashed theme script

- Status: accepted
- Date: 2026-09-23

## Context

The design uses Source Serif 4 and Instrument Sans, plus light and dark themes with a manual toggle. The security model (`docs/security.md`) forbids third-party requests and inline scripts without a CSP hash. A theme chosen by the visitor must apply before first paint, or the page flashes the wrong theme.

## Decision

- Fonts: self-host via `@fontsource-variable/source-serif-4` and `@fontsource/instrument-sans` (latin subset, `font-display: swap`). No Google Fonts requests.
- Theme: a tiny inline script in `<head>` reads the saved choice (inside try/catch) and sets `data-theme` before paint. Its SHA-256 hash is added to the CSP `script-src`. Without a saved choice, CSS follows `prefers-color-scheme`.
- The toggle itself is a small script that stores the choice in `localStorage`.

## Consequences

- No third-party requests; the CSP stays strict (`default-src 'self'`).
- No theme flash on load.
- Font files add ~60–90 KB (cached); preload only the two faces used above the fold.
- The inline script's hash must be updated whenever the script changes (CI will fail via CSP checks in e2e).
