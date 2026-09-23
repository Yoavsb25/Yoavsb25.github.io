---
name: new-page
description: Add a new route under src/pages/ that matches the information architecture, uses BaseLayout, and keeps pages to routing and data loading. Use when the user says "add a page", "new route", "create /<path>", or a roadmap PR needs a page that does not exist yet.
---

# /new-page: add a route

Pages route and load data; they compose feature components and hold no logic of their own (`docs/architecture.md` → Layers and rules).

## Steps

1. **Check the site map.** The page must appear in `docs/information-architecture.md`. If it does not, stop and ask the user: a new public page changes the IA, so update that doc in the same change once agreed. Internal pages (like `/styleguide`) are `noindex` and not linked from navigation.
2. **Pick the file.** `src/pages/<path>.astro`; dynamic routes use `[slug].astro` with `getStaticPaths` (the site is fully static). URLs are lowercase kebab-case and never change once published.
3. **Write the page**, following `src/pages/index.astro`:
   - A `/** */` comment: what the route is and which IA section it implements.
   - Wrap in `BaseLayout` with a `title` (omit only for home) and a `description` of one plain sentence. Pass `noindex` for internal pages.
   - Load content here (`getCollection`, `getEntry`) and pass it down as props. Site facts (URL, name, email) come from `@/config/site`, never literals.
   - Compose feature components (`@/components/<feature>/`); build any that are missing with `/new-component`. Page-level `<style>` is only for layout between sections, using tokens.
   - One `h1`. Section anchors are plain words (`#work`), matching the IA.
   - Every page is at most one click from Hire me and the CV (header covers this; do not remove it).
4. **Logic goes to `src/lib/`** with a unit test (ordering, next-project lookup, date formatting), never inline in the frontmatter.
5. **Verify.** `npm run verify`, then open the route with `npm run dev` and check it renders with JavaScript disabled.
6. **Review.** Run `/design-review`, `/a11y-audit`, and `/perf-audit` on the new route. The e2e suite picks up every built page automatically; run `npm run test:e2e`.

## Rules

- Internal links go through `withBase()` from `@/lib/url` (`withBase("/#work")`), never a bare root-relative string (ADR-0010).
- No client JS unless it is on the allowed list in `docs/architecture.md` → Rendering and interactivity, with a justification comment.
- No third-party embeds, scripts, or fonts (`docs/security.md`).
- Titles and descriptions follow the voice rules in `docs/design-system.md`.
