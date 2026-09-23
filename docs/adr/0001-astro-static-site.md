# 0001. Astro for a static site

- Status: accepted
- Date: 2026-09-23

## Context

The site is content-heavy (projects, writing, CV), must be fast and SEO-friendly, and is hosted on a static-only host.

## Decision

Use Astro with TypeScript (strictest). Pages render to HTML at build time; client JS only via explicit islands.

## Consequences

- Zero JS by default, top Lighthouse scores, typed content collections.
- No server features (API routes, SSR); anything dynamic must be build-time or client-side.
- Rejected: Next.js static export (ships React runtime, loses most features on static hosting); Vite SPA (weaker SEO/first paint).
