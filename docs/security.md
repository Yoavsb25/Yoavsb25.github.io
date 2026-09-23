# Security

## Threat model (static site)

There is no backend, auth, or user data. The main risks are:

| Risk                                | Mitigation                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compromised dependency              | Dependabot, `npm run audit` gate in CI, lockfile committed, `npm ci` only, lockfile-sync pre-commit check                                                           |
| Compromised / mutable GitHub Action | Actions pinned to commit SHAs, Dependabot for actions, actionlint                                                                                                   |
| Over-privileged workflows           | `permissions: contents: read` by default; extra scopes per job only                                                                                                 |
| Leaked secrets                      | No secrets needed; `.env*` gitignored and denied to Claude; secret scan in Claude hooks and pre-commit (`scripts/guards`); GitHub secret scanning + push protection |
| XSS / injected third-party code     | No third-party scripts; Content-Security-Policy via Astro `security.csp` (ADR-0008)                                                                                 |
| Unreviewed changes to `main`        | Branch protection: PR + required checks; CODEOWNERS on guardrails, agents, MCP config, and dependency files                                                         |
| Code vulnerabilities                | CodeQL (security-extended) on PRs and weekly                                                                                                                        |
| Personal data exposure              | Phone number never published; public CV is a copy without it                                                                                                        |

## AI tooling (Claude Code) threat model

Claude reads untrusted text (web pages, copy notes, diffs), so a prompt injection could try to make it change its own guardrails or run code. Mitigations (ADR-0003, ADR-0009):

| Risk                                   | Mitigation                                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent edits its own guardrails         | `.claude/settings.json`, `.claude/hooks/`, `.claude/agents/`, `.claude/skills/`, `scripts/guards/` are protected: edits ask first, and CODEOWNERS review applies |
| Malicious MCP launch command           | `.mcp.json` is protected; the server is a pinned devDependency launched with `npx --no-install`                                                                  |
| Destructive or outward-facing commands | Bash guard denies push, `--no-verify`, hard reset, recursive force delete, global installs, `curl \| sh`, commits on `main`                                      |
| Malicious npm script                   | `package.json` is protected (edits ask first)                                                                                                                    |
| "Read-only" agents writing             | Reviewer agents' Bash is limited to read-only commands by a frontmatter hook; `a11y-reviewer` has no shell                                                       |
| Content agent writing outside copy     | `content-editor` writes are limited to `src/content/**` and `docs/content-inventory.md`                                                                          |
| Browser reaching files or the internet | Playwright MCP: headless, isolated profile, `--allowed-origins http://localhost:4321`; file upload and arbitrary code tools denied                               |

Known limits: the Bash guard reads command text, so scripts that write files are not inspected; CODEOWNERS review is the backstop. In auto mode, "ask" decisions may be approved without a visible prompt.

## Rules

- No API keys or secrets in this repo, ever.
- No third-party scripts, analytics, or CDNs without an ADR.
- External links use `rel="noopener noreferrer"`.
- Never use `pull_request_target` in workflows.
- New MCP servers, agents, or skills that run code need an ADR and security review.
