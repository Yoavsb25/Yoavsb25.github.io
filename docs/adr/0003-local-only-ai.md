# 0003. AI is local-only (Claude Code), no API keys

- Status: accepted
- Date: 2026-09-23

## Context

The project should be AI-first in how it is built and maintained, but without API keys, running costs, or AI acting unattended in CI.

## Decision

All AI usage runs locally through Claude Code, configured in the repo: `CLAUDE.md`, `.claude/settings.json` (permissions, hooks), `.claude/skills/`, `.claude/agents/`, `.mcp.json`. CI stays fully deterministic.

## Consequences

- Every contributor's agent follows the same rules and gates; no secrets to manage.
- Automations run when a human invokes them, and everything lands via a reviewed PR.
- No scheduled AI jobs or AI PR review in GitHub Actions.
