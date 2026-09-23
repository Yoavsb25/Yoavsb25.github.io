# 0013. Link checks with lychee

- Status: accepted
- Date: 2026-09-23

## Context

Broken links on a portfolio cost trust, and the base path (ADR-0010) makes internal links easier to break. External sites fail and rate-limit on their own schedule, so they should not block a PR.

## Decision

- `lycheeverse/lychee-action`, pinned to a commit SHA, checks the built HTML in `_site/` (`npm run stage`) with `--root-dir`, so root-relative links resolve exactly as on Pages.
- PRs: the `links` job in `ci.yml` runs `--offline` (internal links and files only).
- Weekly and on demand: `.github/workflows/links.yml` also checks external links.
- Shared settings live in `lychee.toml`. LinkedIn is excluded because it answers bots with HTTP 999.
- Fragment checks (`--include-fragments`) are enabled in the pages PR, once the home page's section anchors exist.

## Consequences

- Internal breakage fails the PR; external rot shows up as a failed scheduled run.
- The action downloads the lychee release binary at run time without a checksum check; the SHA pin fixes the version, not the bytes. Its token is disabled on PRs (`--offline` makes no GitHub API calls).
- Rejected: an npm link checker such as `linkinator` (another dependency tree under audit); link checks inside the Playwright suite (reimplements a crawler).
