# Information architecture

## Site map

```
/                     Home (single page: hero, how I work, work, resume, contact)
/projects/<slug>      Case study
/404                  Not found
/yoav-sborovsky-cv.pdf  CV download (static file, no phone number)
/sitemap.xml, /robots.txt, /llms.txt   (machine-readable, ADR-0016)

Later:
/projects             All projects (add when there are more than ~6)
/writing, /writing/<slug>, /rss.xml   (phase 2, brand)
```

Home is one page with anchored sections so a recruiter never has to navigate. Case studies are real pages (shareable URLs, SEO), not overlays.

## Global elements

- **Header** (sticky, translucent): YS mark + name (→ home), How I work, Projects, Resume, theme toggle (sun/moon), and a primary **Contact me** button (→ #contact). Below 900px the links collapse into a **Menu** disclosure; theme toggle and Contact me stay visible. This is the one persistent contact button: other sections don't repeat it.
- **Footer**: copyright and a one-line sign-off ("Planned, built, and tested with care.").
- Skip link; visible focus states everywhere.

## Home `/`

1. **Hero** (`#top`): status line with a pulsing dot ("Open to AI engineering roles · London"), serif headline with one italic accent word, one-paragraph lede, _See my work_ (primary; contact is already in the header). Portrait on the right. Plain-language skill chips under a hairline.
2. **How I work** (`#how`): tonal band. Headline, one-line intro, a 7-stage track (Plan → Foundations → Architect → Build → Test → Deploy → Iterate). Selecting a stage shows its plain explanation and an "In practice" example from real work. Default selection: Build.
3. **Selected work** (`#projects`): one featured card (full width) + three cards. The whole card is a link to the case study.
4. **Resume** (`#resume`): experience timeline (roles and education, 1–4 plain bullets each) + sticky aside with "Download CV" and grouped skills.
5. **Contact** (`#contact`): headline, availability line, buttons (Email me, LinkedIn, GitHub, Download CV).

## Case study `/projects/<slug>`

Fixed structure: each section is a required frontmatter field, enforced by the content schema (ADR-0005):

1. "← Back to work" back link (→ /#projects).
2. Header: kicker ("Case study · SysAid · 2025"), title, one-sentence outcome.
3. Meta row: Role, Timeline, Stack, Links.
4. Visual: screenshot or window illustration.
5. Sections with a sticky side table of contents (hidden on mobile):
   - **The problem**: why it mattered
   - **What I built**: 3 bullets
   - **How I approached it**: one paragraph, framed by the lifecycle
   - **Results**: 3 result tiles (big serif figure + label)
6. Next project (Contact me only when there is no next project).

## Navigation rules

- Every page is at most 1 click from contact (header Contact me) and the CV.
- Every case study links to the next project (by `order`, wrapping to the first).
- URLs are lowercase, kebab-case, stable (a slug never changes once published).
- In-page anchors are plain words (`#projects`, `#resume`) so links can be shared.
