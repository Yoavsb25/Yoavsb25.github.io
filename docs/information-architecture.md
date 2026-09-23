# Information architecture

## Site map

```
/                     Home
/projects             All projects
/projects/<slug>      Case study
/about                Experience, skills, CV
/contact              Hire me: email, LinkedIn, CV, availability
/404                  Not found
/cv.pdf               CV download (static file)
/sitemap-index.xml, /robots.txt, /llms.txt   (machine-readable)

Phase 2 (reserved, not built at launch):
/writing, /writing/<slug>, /rss.xml
```

## Global elements

- **Header**: name/logo (→ home), Projects, About, and a primary **Hire me** button (→ /contact). Sticky on scroll, collapses to a menu on mobile.
- **Footer**: email, LinkedIn, GitHub, CV download, "How this site is built" link, copyright.
- Skip link, light/dark theme toggle (the only client-side script expected).

## Pages

### Home `/`

1. **Hero**: name, title, one-liner, location/availability, CTAs: _Hire me_ (primary), _Download CV_ (secondary).
2. **Featured projects**: 3 cards (title, one-line outcome, stack tags) → case studies.
3. **What I do**: 3 capability pillars (e.g. AI agents and automation · full-stack AI apps · ML fundamentals), each backed by a project.
4. **Experience snapshot**: latest 2–3 roles → /about.
5. **Closing CTA**: "Let's build something" → /contact.

### Projects `/projects`

Grid of all projects, featured first. Filter by tag (static, no JS required: tag links or anchors). Each card: title, summary, tags, links (case study, repo, live demo).

### Case study `/projects/<slug>`

Fixed structure, enforced by the content schema:

1. Header: title, one-line outcome, role, timeframe, stack, links.
2. **Problem**: context and constraints.
3. **Approach and architecture**: diagram + key decisions and trade-offs.
4. **Results**: concrete outcomes (numbers where possible).
5. **What I'd do next / lessons**.
6. Next project + Hire me CTA.

### About `/about`

Short bio (human, first person) → experience timeline → skills grouped by area → education → CV download.

### Contact `/contact`

One clear block: what roles he's looking for, availability, email (mailto), LinkedIn, CV download. No form.

## Navigation rules

- Every page is at most 1 click from Hire me.
- Every case study links to the next project and to contact.
- URLs are lowercase, kebab-case, stable (a slug never changes once published).
