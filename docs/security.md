# Security

## Threat model (static site)

There is no backend, auth, or user data. The main risks are:

| Risk                                | Mitigation                                                                                                                                                                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compromised dependency              | Dependabot, `npm run audit` gate in CI, lockfile committed, `npm ci` only, lockfile-sync pre-commit check; Lighthouse runs from a SHA-pinned action (ADR-0012). Not integrity-checked: the lychee binary (release download, version pinned by the action; ADR-0013) and Playwright's Chromium |
| Compromised / mutable GitHub Action | Actions pinned to commit SHAs, Dependabot for actions, actionlint                                                                                                                                                                                                                             |
| Over-privileged workflows           | `permissions: contents: read` by default; extra scopes per job only (`pages: write` + `id-token: write` on the deploy job alone)                                                                                                                                                              |
| Leaked secrets                      | No secrets needed; `.env*` gitignored and denied to Claude; secret scan in Claude hooks and pre-commit (`scripts/guards`); GitHub secret scanning + push protection                                                                                                                           |
| XSS / injected third-party code     | No third-party scripts; Content-Security-Policy `<meta>` via Astro `security.csp` (ADR-0008): `default-src 'self'`, hashed scripts and styles, `object-src 'none'`, `base-uri 'self'`, `form-action 'none'`; no inline `style` attributes. e2e fails on any CSP violation                     |
| Unreviewed changes to `main`        | Branch protection: PR + required checks; CODEOWNERS on guardrails, agents, MCP config, and dependency files                                                                                                                                                                                   |
| Code vulnerabilities                | CodeQL (security-extended) on PRs and weekly                                                                                                                                                                                                                                                  |
| Personal data exposure              | Phone number never published; public CV is a copy without it                                                                                                                                                                                                                                  |

CSP limits:

- GitHub Pages cannot send response headers, and a `<meta>` policy cannot set `frame-ancestors` or reporting. Framing (clickjacking) is accepted: the site has no forms, logins, or actions to trick a visitor into.
- A `<meta>` policy applies only to what follows it, and Astro emits it after the fonts, the theme script, and JSON-LD. Everything before it is ours; JSON-LD goes through `serializeJsonLd` (escapes `<`, unit tested). Never interpolate content into `<head>` without escaping.
- On `yoavsb25.github.io`, `'self'` (and `localStorage`) covers every GitHub Pages repo on the account. Accepted: all are ours. A custom domain would remove this.

## AI tooling (Claude Code) threat model

Claude reads untrusted text (web pages, copy notes, diffs), so a prompt injection could try to make it change its own guardrails or run code. Mitigations (ADR-0003, ADR-0009):

| Risk                                      | Mitigation                                                                                                                                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent edits its own guardrails            | All of `.claude/` (including the gitignored `settings.local.json`), `CLAUDE.md`, and `scripts/guards/` are protected: edits ask first (paths resolved, case-insensitive), and CODEOWNERS review applies to committed files |
| Malicious MCP launch command              | `.mcp.json` is protected; the server is a pinned devDependency launched with `npx --no-install`                                                                                                                            |
| Destructive or outward-facing commands    | Bash guard denies push, `--no-verify`, hard reset, recursive force delete, global installs, `curl \| sh`, commits on `main`                                                                                                |
| Malicious npm script                      | `package.json` is protected (edits ask first)                                                                                                                                                                              |
| "Read-only" agents writing                | Global guard hooks key on `agent_type`: reviewers may run one plain read-only command (no metacharacters, whole-command allowlist); `a11y-reviewer` has no shell                                                           |
| Content agent writing outside copy        | `content-editor` writes are limited to `src/content/**`                                                                                                                                                                    |
| Script injected through content           | Frontmatter links must be `https://` (schema); a unit test rejects `<script>`, frames, embeds, `on*=` handlers, and `javascript:` in `src/content/**` (ADR-0014)                                                           |
| Untrusted README text in `/sync-projects` | Read-only `gh repo list`/`view` on public repos only; README text is data, never instructions; every change is approved by the user                                                                                        |
| Browser reaching files or the internet    | Playwright MCP: headless, isolated profile, `--allowed-origins http://localhost:4321`; `browser_evaluate` (page-side JS, same origin limit) allowed; file upload and Node-side `browser_run_code_unsafe` denied            |

Guard hooks fail closed: an error in a guard denies the action.

Known limits: the Bash guard reads command text, so scripts that write files are not inspected; CODEOWNERS review is the backstop. In auto mode, "ask" decisions may be approved without a visible prompt.

## Rules

- No API keys or secrets in this repo, ever.
- No third-party scripts, analytics, or CDNs without an ADR.
- External links use `rel="noopener noreferrer"`.
- Never use `pull_request_target` in workflows.
- CI reports (Lighthouse, Playwright) stay on the runner or in workflow artifacts; never upload them to public storage.
- New MCP servers, agents, or skills that run code need an ADR and security review.
