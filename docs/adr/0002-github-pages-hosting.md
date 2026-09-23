# 0002. GitHub Pages hosting

- Status: accepted
- Date: 2026-09-23

## Context

We want free, simple hosting that lives next to the code with no extra accounts.

## Decision

Deploy `dist/` to GitHub Pages via the official Pages actions. Custom domain later, configured through `src/config/site.ts`.

## Consequences

- No servers, no cost, deploys tied to merges on `main`.
- No custom HTTP headers: security headers (CSP) must be delivered via `<meta>` tags.
- Project pages are served under `/<repo>/` until a custom domain is set; the base path must be handled at deploy time.
