# 0014. Case studies in Markdown, not MDX

- Status: accepted
- Date: 2026-09-23

## Context

ADR-0005 stores case studies as MDX. Every required section lives in frontmatter, and the body is only an optional deep dive; no case study needs components in its body. MDX would add `@astrojs/mdx` and its dependencies, and lets a content file import and run code.

## Decision

- Case studies are plain Markdown: `src/content/projects/<slug>/index.md`, rendered by Astro's built-in Markdown support. Everything else in ADR-0005 stands.
- `cover` is optional (`{ src, alt }`, validated by `image()` when present): the approved design has text-only work cards.
- Unconfirmed facts are omitted where the schema allows it and marked with a `# TODO(confirm)` YAML comment, resolved in `content/launch-content`.

## Consequences

- No new dependency; content files cannot import code.
- A deep dive that needs a component (an interactive diagram, a custom figure) requires adopting MDX then: add the integration and rename the file (valid Markdown is valid MDX).
- `TODO(confirm)` comments are not enforced by the build; the launch checklist must search for them.
- Rejected: MDX now, which pays a dependency cost for a capability no case study uses.
