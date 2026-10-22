# Product brief

## Goal

Get Yoav hired, in **AI engineering or technical program management** roles, and build a long-term personal brand as someone who takes products from idea to production. The site never names a single target title, so it fits both.

The site is a business card that proves the claim instead of stating it: every page, and the repo itself, demonstrates how he plans, builds, tests, and ships.

## Positioning

**Today** (LinkedIn): "Software Engineer @ SysAid | AI Builder". The site matches it.
**Target**: a software engineer and AI builder who takes products from idea to production. Automation, CI/CD, delivery, and stakeholder work become the _evidence_, not the title.

Approved hero copy (from the design mockup):

> **I turn ideas into _working_ tech.**
> I'm Yoav. I take products from idea to production: I plan them, build them, test them, and keep improving them, working with everyone who has a stake in the result.

## Audiences

| Priority | Who                              | Time on site | Needs to find                                                               |
| -------- | -------------------------------- | ------------ | --------------------------------------------------------------------------- |
| 1        | **Recruiter**                    | ~30 s        | Title, location, photo, core skills, 2–3 standout projects, CV, contact     |
| 2        | **Hiring manager / interviewer** | 3–10 min     | How he thinks: case studies with problem, approach, results; code on GitHub |
| 3        | **Community / peers** (brand)    | varies       | What he builds and believes; later, writing                                 |

**Recruiters come first.** The site must be easy to read and use: plain language, no jargon, few numbers, no diagrams on the home page, no developer-terminal aesthetic. Technical depth lives inside case studies, for those who look for it.

## Primary action: "Contact me"

Every page leads to one conversion path:

1. **Contact**: email (`mailto:`) and LinkedIn, one click from any page via the persistent header "Contact me" button. The button appears once per view, not repeated in every section.
2. **CV download**: always next to contact and in the Resume section.

Secondary action: open a case study. Every case study ends with "Next project" (or "Contact me" on the last one).

## Key journeys

- **Recruiter scan**: hero (photo, title, location, See my work) → Selected work → Resume → Download CV. Works in under 30 seconds on a phone.
- **Hiring manager deep dive**: home → case study (problem, what I built, approach, results) → GitHub → contact.
- **Peer / brand**: home → "How I work" → "This website, built with AI" case study.

## Content at launch

- 4 case studies: this website, release automation platform (SysAid), Files Unifier, Pitch Star
- Experience, education, skills, CV
- Later (phase 2, brand): writing/blog, talks, open-source highlights

Full copy and data: `src/content/` (schemas in `src/content.config.ts`). Anything not yet confirmed is marked `TODO(confirm)`.

## Success criteria

- A recruiter finds title, photo, skills, CV, and contact within 30 seconds on mobile.
- Lighthouse 100 accessibility and SEO, ≥ 95 performance, in both themes.
- Every case study states the problem, what was built, and concrete results.
- The repo itself is presentable as a case study (docs, ADRs, guardrails).

## Non-goals (for launch)

- Runtime AI features, chatbots, or anything needing an API key (ADR-0003).
- A blog (phase 2; the IA reserves space for it).
- Contact forms or any backend (static hosting, ADR-0002).
- Analytics or tracking scripts (revisit with an ADR if needed).
- Publishing the phone number (the public CV omits it).

## Decisions made

| Question            | Decision                                                  |
| ------------------- | --------------------------------------------------------- |
| Title and hero copy | Approved (above)                                          |
| Case studies        | This website, release platform, Files Unifier, Pitch Star |
| Contact             | Email Yoavsb25@gmail.com, LinkedIn, GitHub, CV download   |
| Photo               | GitHub headshot in the hero                               |
| Design              | Direction A, recruiter-first (`docs/design-system.md`)    |

## Still open

1. Custom domain name.
2. Exact dates for Files Unifier and Pitch Star.
3. Confirm SysAid work can be described publicly at the level in the content inventory.
