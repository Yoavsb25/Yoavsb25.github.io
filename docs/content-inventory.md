# Content inventory

The approved copy and data for launch, taken from the design mockup (v2) and Yoav's CV. This is the source for the content collections (ADR-0005); the build PR moves it into `src/content/`.

Status: ✅ approved · 🟡 needs confirmation · ❓ missing

## Sources

| Source              | Location                                                       | Notes                                                      |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- |
| CV (PDF)            | `~/Desktop/Work/cv/yoav-sborovsky-cv.pdf` (local, not in repo) | Contains the phone number; the public `cv.pdf` must not    |
| Work history detail | `~/Desktop/Work/SysAid/profile-summaries/` (local)             | Metrics such as the 75% faster translation workflow        |
| Headshot            | GitHub avatar (`avatars.githubusercontent.com/u/119051063`)    | Download, optimize, and store as `src/assets/portrait.jpg` |
| Design mockup       | `docs/design/mockup.html`                                      | Visual and copy reference                                  |

## Profile ✅

| Field            | Value                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name             | Yoav Sborovsky                                                                                                                                                            |
| Status line      | Open to AI engineering roles · London                                                                                                                                     |
| Headline         | I plan AI systems. Then I _ship_ them.                                                                                                                                    |
| Lede             | I'm Yoav, an AI engineer who takes products from idea to production. I plan them, build them, test them, and keep improving them, with the care that makes AI dependable. |
| Portrait badge   | Automation Engineer · at SysAid · London                                                                                                                                  |
| Skill chips      | AI agents & tools · LLM applications · Automation · Python · TypeScript · CI/CD & deployment · Docker & AWS                                                               |
| Email            | Yoavsb25@gmail.com                                                                                                                                                        |
| LinkedIn         | https://www.linkedin.com/in/yoav-sborovsky-5a85b41a1/                                                                                                                     |
| GitHub           | https://github.com/Yoavsb25                                                                                                                                               |
| Contact headline | Need an AI engineer who _ships_?                                                                                                                                          |
| Contact line     | I'm looking for AI engineering roles in London or remote. I reply within a day.                                                                                           |
| Phone            | Not published                                                                                                                                                             |

## How I work ✅

Default selected stage: **Build**.

| Stage       | Title                   | Explanation                                                                                        | In practice                                                                                               |
| ----------- | ----------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Plan        | Start with the problem  | Before any code: who is this for, what problem does it solve, and how will we know it worked?      | Every project starts with a one-page brief that sets the goal, the users, and what is out of scope.       |
| Foundations | Set up the guardrails   | Automatic checks, reviews, and safe defaults go in first, so quality never depends on remembering. | This website blocks leaked passwords and broken code before a change can even be saved.                   |
| Architect   | Design for change       | A simple structure with clear boundaries, so the system is easy to grow and easy to hand over.     | At SysAid I designed a way to move 29 components to a new release system without pausing weekly releases. |
| Build       | Ship in small steps     | Working software in small, reviewable pieces. AI speeds up the work; clear rules keep it right.    | I built an AI translation tool end to end, from the first prototype to a tool the team relies on.         |
| Test        | Prove it works          | Automated tests confirm it works today and keep it working tomorrow.                               | I built a central place for test results, so failures across every environment are visible in one view.   |
| Deploy      | Release with confidence | Releases are automatic and repeatable, so shipping is routine instead of risky.                    | Releases across 14 repositories are coordinated automatically, with no manual steps to forget.            |
| Iterate     | Learn and improve       | Measure what happened, learn from it, and make the next version better.                            | My AI assistants help engineers find the root cause of incidents faster, and they improve with every use. |

## Case studies

Order on the home page: featured first, then as listed.

### 1. This website, built with AI · `portfolio` ✅ (featured)

- **Kicker**: Featured · 2026
- **Summary**: A portfolio built the way I build products: planned first, protected by automatic checks, and developed with AI assistants that follow the same rules as a human engineer.
- **Tags**: AI-assisted development · Quality automation · TypeScript
- **Outcome**: A personal website that doubles as proof of how I work: every change planned, checked, and reviewed.
- **Meta**: Role: Solo, end to end · Timeline: 2026 · Stack: Astro, TypeScript, Claude Code · Links: GitHub (this repo)
- **Problem**: Most portfolios say "I write quality code" without showing it. I wanted the website itself to be the evidence, including how it was built with AI.
- **What I built**: a fast, accessible website with no unnecessary code sent to visitors · automatic guardrails that stop leaked passwords, broken code, and risky changes before they are saved · AI assistants set up with clear rules, so they work like a careful teammate.
- **Approach**: I followed the same steps I use at work: a written plan, foundations and checks first, a simple structure, then small reviewed changes, each tested automatically before going live.
- **Results**: 100% of changes reviewed and tested before going live · 0 passwords or secrets ever committed · 1 click to publish a new version

### 2. Release automation platform · `release-platform` 🟡 (confirm public detail level)

- **Kicker**: SysAid · 2025
- **Summary**: A platform that releases 29 software components automatically, replacing manual coordination.
- **Tags**: Automation · Python · CI/CD
- **Outcome**: Weekly releases across 29 components and 14 repositories, with no manual steps.
- **Meta**: Role: Designed and built solo · Timeline: 2025 – Present · Stack: Python, GitHub Actions, Kargo · Links: Internal project
- **Problem**: Releasing meant a person coordinating many teams and repositories by hand every week: slow, error-prone, and hard to scale.
- **What I built**: one central registry describing every component and how it ships · automated release coordination across 14 repositories and a 6-service codebase · a gradual migration path to a new deployment system, without pausing weekly releases.
- **Approach**: I mapped the existing process first, then automated it one step at a time behind quality checks, so the team could trust each new piece before relying on it.
- **Results**: 29 components released automatically · 14 repositories coordinated · 0 manual release steps

### 3. Files Unifier · `files-unifier` 🟡 (confirm timeline)

- **Kicker**: Client project
- **Summary**: A desktop tool, sold to a leading law firm, that turns a spreadsheet into merged, ready-to-send PDFs.
- **Tags**: Automation · Python · Desktop app
- **Outcome**: Built and sold to Goldfarb Gross Seligman, now used internally for document workflows.
- **Meta**: Role: Solo, sold to client · Timeline: ❓ · Stack: Python, GitHub Actions · Links: github.com/Yoavsb25/files-unifier
- **Problem**: Staff were assembling large batches of documents by hand, a slow and repetitive task where mistakes were costly.
- **What I built**: a desktop app (choose a spreadsheet, get merged PDFs) · built-in logging and licensing so the firm can run it safely · automated tests and a one-file installer.
- **Approach**: I designed it as a simple pipeline of small steps, each tested on its own, so it stays reliable as the firm's needs change.
- **Results**: Sold to a leading law firm · 1 step from spreadsheet to merged PDFs · 1-file installer, no setup needed

### 4. Pitch Star · `pitch-star` 🟡 (confirm timeline)

- **Kicker**: iOS app
- **Summary**: A music quiz app for iPhone: name the year of 800+ FIFA soundtrack songs.
- **Tags**: SwiftUI · Firebase · Product
- **Outcome**: A complete iPhone app with daily challenges and a subscription model.
- **Meta**: Role: Solo, end to end · Timeline: ❓ · Stack: Swift, SwiftUI, Firebase · Links: github.com/Yoavsb25/fifa-songs-app
- **Problem**: A fun idea: can football fans guess the year of a FIFA soundtrack song? I wanted to take it all the way to a real product.
- **What I built**: a native iPhone app with 800+ tracks from 25+ years · daily challenges synced to the cloud · a free version with an optional subscription.
- **Approach**: Product first: I defined the core game loop, then built only what made the game better.
- **Results**: 800+ songs across 25+ years · Daily challenges, synced to the cloud · Free and subscription plans

Not used at launch: coursework, wedding site, forks, earlier portfolio attempts, `claude-code-tools` (candidate for a later case study), `prenup-ai-knowledge` (private).

## Resume ✅

### Experience

**Automation Engineer** · SysAid Technologies · London · 2025 – Present

- Built the platform the company uses to release its 29 software components, with no manual steps.
- Created an AI-powered translation tool that supports multiple languages and made the workflow 75% faster.
- Built AI assistants (Claude Code) that help engineers investigate incidents and failed tests faster.
- Automated release coordination across 14 repositories.

**Data Analyst** · Affilomania · Tel Aviv · 2020 – 2021

- Improved how sales leads were distributed, increasing sales by 15%.

### Education

**B.Sc. Computer Science & Entrepreneurship** · Reichman University · 2022 – 2025

- Machine Learning, Operating Systems, Product Management.
- Top 2% nationwide on the university entrance exam.

### Skills

| Group           | Items                                              |
| --------------- | -------------------------------------------------- |
| AI & automation | Claude Code, LLM integrations, AI-assisted tooling |
| Languages       | Python, TypeScript, SQL                            |
| Infrastructure  | Docker, AWS, GitHub Actions, Kubernetes (GitOps)   |
| Testing         | Pytest, Playwright, Vitest                         |

### CV download ❓

A web copy of the CV without the phone number, saved as `public/cv.pdf`.
