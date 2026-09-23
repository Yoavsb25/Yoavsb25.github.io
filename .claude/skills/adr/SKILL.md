---
name: adr
description: Record an architecture decision as the next numbered ADR in docs/adr/. Use when a significant decision is made or changed — a new dependency, pattern, service, tool, or a reversal of an earlier ADR — or when the user says "write an ADR", "record this decision", or "why did we choose X" and no ADR exists yet. CLAUDE.md requires an ADR for every significant decision.
---

# /adr: record a decision

An ADR captures one decision so a future reader (human or agent) knows what was chosen, why, and what it costs. Keep it short: most ADRs are 15–30 lines.

## Steps

1. **Pin the decision.** State it in one sentence. If the conversation has not settled on one option yet, stop and ask the user to choose; an ADR records a decision, it does not make one.
2. **Check for overlap.** `ls docs/adr/` and read any ADR on the same topic.
   - Refining an accepted ADR (same decision, more detail): edit that ADR instead of adding a new one.
   - Reversing or replacing one: write a new ADR and set the old one's status to `superseded by NNNN`.
3. **Number it.** Next number = highest existing number + 1, zero-padded to 4 digits. File name: `docs/adr/NNNN-kebab-case-title.md`, title under ~6 words.
4. **Write it** from `docs/adr/0000-template.md`:
   - `Status: accepted` (or `proposed` if the user has not confirmed), `Date:` today in `YYYY-MM-DD`.
   - **Context**: the problem and constraints, 2–4 sentences. Link the doc or ADR that forced the question.
   - **Decision**: what we chose, concretely (package names, file paths, rules). Bullets are fine.
   - **Consequences**: what gets easier, what gets harder, and one line naming the main alternative(s) rejected and why.
5. **Update references.** If the decision changes a rule or structure described elsewhere, update that doc in the same change: `CLAUDE.md` (rules), `docs/architecture.md` (structure), `docs/security.md` (threats), `docs/design-system.md` (design).
6. **Verify.** Run `npm run verify` (Prettier formats Markdown tables).

## Rules

- One decision per ADR.
- Plain, specific language. No "leverage", no marketing.
- Never rewrite history: an accepted ADR's decision is changed only by superseding it, except to add detail that does not change the decision.
