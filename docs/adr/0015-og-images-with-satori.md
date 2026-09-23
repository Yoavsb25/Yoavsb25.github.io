# 0015. Build-time Open Graph images with satori and sharp

- Status: accepted
- Date: 2026-09-23

## Context

Links to the site are shared on LinkedIn, Slack, and email, where the preview image is the first impression. Each case study should preview with its own title, in the site's fonts and colors, and stay current when content changes. The site has no server (ADR-0001), so images must be made at build.

## Decision

- `src/lib/og.ts` builds a 1200×630 card as an element tree and renders it with `satori` (layout and text to SVG, with our fonts) and `sharp` (SVG to PNG).
- `src/pages/og/[...key].png.ts` emits `/og/home.png` and `/og/projects/<slug>.png` for every published project. `BaseLayout` points `og:image` at them (`image` prop, default `home`).
- Fonts: WOFF copies of Source Serif 4 400 and Instrument Sans 400/600 (latin, Fontsource 5.3.0, OFL licenses beside them) in `src/assets/og/`, with source URLs and sha256 in `SOURCES.md`. satori cannot read WOFF2 or CSS variables, so colors are copied from the light theme in `tokens.css`.
- Both are devDependencies: they run at build only and ship nothing to visitors. `satori` is pinned exactly; `sharp` matches the version Astro already installs.

## Consequences

- Previews update with the content and need no manual step; `tests/unit/og.test.ts` renders one, and e2e checks every page's `og:image` loads.
- Token changes must be mirrored in `og.ts` by hand (three colors).
- `satori` depends on `fflate` 0.7.3 (via `@shuding/opentype.js`), which has a moderate advisory for malformed ZIP64 archives (GHSA-px8p-9vwx-vf98). Not reachable: the only input is our own font files. The `npm run audit` gate (high/critical) passes; revisit when satori updates it.
- Rejected: one static image for every page (no per-project title, goes stale); Playwright screenshots committed to the repo (no new dependency, but images drift from content).
