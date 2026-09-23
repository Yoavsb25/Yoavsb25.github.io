# Security

## Threat model (static site)

There is no backend, auth, or user data. The main risks are:

| Risk                                | Mitigation                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Compromised dependency              | Dependabot, `npm audit` gate in CI, lockfile committed, `npm ci` only           |
| Compromised / mutable GitHub Action | Actions pinned to commit SHAs, Dependabot for actions, actionlint               |
| Over-privileged workflows           | `permissions: contents: read` by default; extra scopes per job only             |
| Leaked secrets                      | No secrets needed; `.env*` gitignored; GitHub secret scanning + push protection |
| XSS / injected third-party code     | No third-party scripts; Content-Security-Policy meta tag _(planned)_            |
| Unreviewed changes to `main`        | Branch protection: PR + required checks                                         |
| Code vulnerabilities                | CodeQL (security-extended) on PRs and weekly                                    |

## Rules

- No API keys or secrets in this repo, ever.
- No third-party scripts, analytics, or CDNs without an ADR.
- External links use `rel="noopener noreferrer"`.
- Never use `pull_request_target` in workflows.
