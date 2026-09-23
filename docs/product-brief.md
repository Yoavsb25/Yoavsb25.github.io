# Product brief

## Goal

Get Yoav hired as an **AI engineer**, and build a long-term personal brand around that identity.

The site is a business card that proves the claim instead of stating it: every page, and the repo itself, should demonstrate production-grade AI engineering judgment.

## Positioning

**Today** (GitHub profile): "Full-Stack Developer · Automation Engineer · AI Enthusiast".
**Target**: "AI Engineer who ships production systems" — full-stack and automation experience become the _evidence_, not the title.

Draft one-liner (to refine in the design PR):

> AI engineer building reliable, production-grade AI systems — from agent workflows to the full-stack apps around them.

## Audiences

| Priority | Who                                          | Time on site | Needs to find                                                                   |
| -------- | -------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| 1        | **Recruiter**                                | ~30 s        | Title, location/right-to-work, core skills, 2–3 standout projects, CV, contact  |
| 2        | **Hiring manager / AI engineer interviewer** | 3–10 min     | How he thinks: architecture, trade-offs, results, code quality (links to repos) |
| 3        | **Community / peers** (brand)                | varies       | What he builds and believes; later, writing                                     |

## Primary action: "Hire me"

Every page leads to one conversion path:

1. **Contact** — email and LinkedIn, one click from any page (persistent header CTA).
2. **CV download** — PDF, always available next to contact.

Secondary action: explore case studies (which should end by pointing back to "Hire me").

## Key journeys

- **Recruiter scan**: Home hero (title, location, CTA) → featured projects → CV download. Must work in under 30 seconds on a phone.
- **Hiring manager deep dive**: Home → a case study (problem, architecture, decisions, results) → repo on GitHub → contact.
- **Peer / brand**: Home → projects → "How this site is built" case study (the AI-first repo itself).

## Content at launch

- Project case studies (3–5, see `docs/content-inventory.md`)
- Experience and CV
- Later (phase 2, brand): writing/blog, talks, open-source highlights

## Success criteria

- A recruiter can find title, skills, CV, and contact within 30 seconds on mobile.
- Lighthouse 100 accessibility and SEO, ≥ 95 performance.
- Every case study shows an architecture decision and a measurable or concrete outcome.
- The repo itself is presentable as a case study (docs, ADRs, guardrails).

## Non-goals (for launch)

- Runtime AI features, chatbots, or anything needing an API key (ADR-0003).
- A blog (planned for phase 2; the IA reserves space for it).
- Contact forms or any backend (static hosting, ADR-0002).
- Analytics or tracking scripts (revisit with an ADR if needed).

## Open questions for Yoav

1. Final title wording and one-liner.
2. Which projects become case studies (see the content inventory).
3. Experience details and the CV PDF.
4. Location and work-authorization line (e.g. "London · open to hybrid/remote").
5. Custom domain name.
