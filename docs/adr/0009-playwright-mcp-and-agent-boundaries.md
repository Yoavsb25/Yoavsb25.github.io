# 0009. Playwright MCP as a pinned dev dependency, and scoped agents

- Status: accepted
- Date: 2026-09-23

## Context

The a11y and design reviews need a real browser, which Claude Code gets through the Playwright MCP server. A project `.mcp.json` runs for everyone who opens the repo, and `enabledMcpjsonServers` pre-approves a server by name, so the launch command itself becomes part of the attack surface. The security review of PR 6 also found that "read-only" agents and the content editor were limited only by their prompts.

## Decision

- `@playwright/mcp` is an exact-pinned devDependency. `.mcp.json` launches it with `npx --no-install playwright-mcp`, so nothing is downloaded at session start and the lockfile, `npm run audit`, and Dependabot all cover it.
- The browser runs `--headless --isolated` (in-memory profile) with `--allowed-origins http://localhost:4321`, and `browser_file_upload` and `browser_run_code_unsafe` are denied in `.claude/settings.json`.
- `.mcp.json`, `.claude/agents/`, `.claude/skills/`, and `package.json` are protected paths (edits ask first) and are in CODEOWNERS.
- Agent boundaries are enforced by hooks in each agent's frontmatter, backed by tested rules in `scripts/guards/rules.mjs`:
  - `code-reviewer`, `security-reviewer`: Bash limited to read-only commands (`checkReadOnlyCommand`).
  - `content-editor`: writes limited to `src/content/**` and `docs/content-inventory.md` (`checkContentPath`).
  - `a11y-reviewer`: no shell at all.

## Consequences

- The MCP server version changes only through a reviewed lockfile update.
- A prompt-injected edit to the MCP command, an agent's tools, or a skill script needs explicit approval, and code-owner review on GitHub.
- Contributors run `npm ci` (and `npx playwright install chromium` once) before the browser tools work.
- `--allowed-origins` limits accidental reach; it is not a security boundary by itself.
- Rejected: `npx -y @playwright/mcp@x.y.z` (unverified download on each cold cache); relying on agent prompts alone for read-only behavior.
