# Design system

Direction **A · The Pipeline, recruiter-first**, approved from the mockup (`docs/design/mockup.html`, v2).

## Principles

1. **Recruiters first.** Plain language, generous spacing, no jargon, few numbers, no diagrams on the home page. Depth lives in case studies.
2. **Clean, not "developer".** No terminal look, no monospace, no neon. Editorial serif headlines and a calm sans for everything else.
3. **Soft transitions.** Sections change tone by one step, with faded edges. Never jump from very light to very dark.
4. **One accent, used sparingly.** Shipping green signals "done and live": check marks, the italic headline word, active states.
5. **Every detail is deliberate.** Consistent radii, one type scale, one motion curve, both themes designed (not inverted).

Inspiration: igaltal.github.io/portfolio (editorial type, restraint, "proof over claims"). We deliberately differ: a different typeface pair, a green accent instead of indigo, no dark showcase band, recruiter-first copy.

## Color tokens

**Source of truth: [`src/styles/tokens.css`](../src/styles/tokens.css)** (values for both themes). Components use tokens only: no hex values or ad-hoc sizes. See every token rendered in both themes at `/styleguide`.

| Token           | Use                                         |
| --------------- | ------------------------------------------- |
| `--ground`      | Page background                             |
| `--ground-2`    | Tonal band, footer, case-study "next" block |
| `--surface`     | Cards, panels, ghost buttons                |
| `--ink`         | Headings, primary text, primary button      |
| `--ink-2`       | Body text, secondary text                   |
| `--ink-3`       | Labels, meta, captions                      |
| `--line`        | Borders, dividers, inactive track           |
| `--accent`      | Accent word, ticks, links, active stage     |
| `--accent-ink`  | Text on accent                              |
| `--accent-soft` | Card illustration backgrounds               |
| `--glow`        | Faint radial glow behind the hero           |

`--ink-3` is darker than in the mockup (light `#626B74`, dark `#8F9B95`): the mockup values failed WCAG AA for small label text (3.65:1). Every text/background pair now measures at least 4.6:1 in both themes.

Rules:

- Dark mode is a soft charcoal-green, never pure black.
- Section changes use `--ground` → `--ground-2` with a ~110px gradient fade at each edge.
- All text/background pairs meet WCAG AA (4.5:1 body, 3:1 large text) in both themes; check with axe in CI.

## Typography

Self-hosted (ADR-0008), with system fallbacks.

| Role               | Face                               | Weights              | Fallback                          |
| ------------------ | ---------------------------------- | -------------------- | --------------------------------- |
| Display / headings | **Source Serif 4** (optical sizes) | 400, 400 italic, 500 | Iowan Old Style, Georgia, serif   |
| Body / UI          | **Instrument Sans**                | 400, 500, 600        | Helvetica Neue, Arial, sans-serif |

No monospace face on the site.

| Style              | Size                       | Line height | Notes                                            |
| ------------------ | -------------------------- | ----------- | ------------------------------------------------ |
| Hero h1            | `clamp(46px, 7.4vw, 96px)` | 1.0         | Serif 400, tracking −2%, one italic accent word  |
| Case study h1      | `clamp(42px, 6.4vw, 76px)` | 1.02        | Serif                                            |
| Section h2         | `clamp(36px, 5vw, 58px)`   | 1.05        | Serif, one italic accent word at most            |
| h3 (cards, stages) | 28–38px                    | 1.1         | Serif                                            |
| Role title         | 22px                       | 1.25        | Sans 500                                         |
| Lede               | `clamp(18px, 2vw, 20px)`   | 1.55        | `--ink-2`                                        |
| Body               | 17px                       | 1.6         | Max ~65 characters per line                      |
| Label (eyebrow)    | 12.5px                     | 1           | Sans 600, uppercase, +0.09em tracking, `--ink-3` |
| Small / meta       | 13.5–15px                  | 1.4         |                                                  |

Headings use `text-wrap: balance`. Numbers in timelines use `tabular-nums`.

## Layout and spacing

- Container: max 1120px, 24px side gutter (16px minimum on small phones).
- Section rhythm: 104–120px vertical padding on desktop, 80px on mobile.
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 120. Use `gap` on flex/grid, not margins between siblings.
- Grids: work cards in 3 columns (featured spans all), resume 1.6fr / 1fr, case study 220px TOC / content. All collapse to one column below 900px.

## Shape and depth

| Token           | Value                                                               | Use                              |
| --------------- | ------------------------------------------------------------------- | -------------------------------- |
| `--radius-pill` | 999px                                                               | Buttons, chips, tags             |
| `--radius-lg`   | 20px                                                                | Cards, panels                    |
| `--radius-xl`   | 24–28px                                                             | Portrait, case-study visuals     |
| `--radius-sm`   | 12px                                                                | Window illustrations             |
| `--shadow`      | light: `0 1px 2px rgb(22 25 29/.04), 0 10px 30px rgb(22 25 29/.07)` | Hover and floating elements only |

Borders separate; shadows lift. A card gets a shadow only on hover.

## Motion

- One curve: `--ease: cubic-bezier(.2, .7, .2, 1)`. Durations: 160ms (press, hover), 240–340ms (cards, content swaps), 400ms (theme change), 520ms (track fill), 700ms (hero load).
- Hero lines rise 12px on load, staggered 90ms, starting visible (opacity .4 → 1), never hidden.
- Cards lift 4px on hover; arrows nudge 3px right.
- Status dot pulses (2.4s).
- `prefers-reduced-motion`: all animation and transitions off.

## Components

| Component         | Spec                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Button**        | 48px tall (40px in header), pill. _Primary_: ink background, hover → accent. _Ghost_: surface + line border. Optional trailing arrow. Press scales to .98                                                                                        |
| **Header**        | Sticky, 70px, translucent ground + blur, hairline bottom border. Brand mark: 34px ink square (9px radius) with serif "YS"                                                                                                                        |
| **Theme toggle**  | 40px circle, sun/moon icon. Follows the system theme until chosen, then remembered. No flash on load (ADR-0008)                                                                                                                                  |
| **Status line**   | Pulsing 8px accent dot + 15px medium text                                                                                                                                                                                                        |
| **Portrait**      | 4:5, radius 28px, border + shadow, with a floating badge (role + company) overlapping the bottom-left                                                                                                                                            |
| **Skill chip**    | Pill, surface + line border, 14.5px `--ink-2`                                                                                                                                                                                                    |
| **Stage track**   | 7 stages on one line (vertical list on mobile). 32px dots: inactive = line border; done = accent border + tick; active = filled accent, scale 1.1. Accent fill line animates to the active stage. Detail area: explanation + "In practice" panel |
| **Work card**     | Whole card is a link. Illustration area (accent-soft gradient) + body: label, serif title, summary, tags, "Read the case study →". Featured card spans all columns in two halves                                                                 |
| **Timeline role** | Date column (150px, tabular) + title, place, 1–4 bullets with accent markers; hairline between roles                                                                                                                                             |
| **Panel**         | Surface, line border, radius 18px; used for CV download and skills                                                                                                                                                                               |
| **Result tile**   | Surface card with a 34px serif accent figure + short label                                                                                                                                                                                       |
| **Copy button**   | Small pill; "Copy" → "Copied" for 1.6s; falls back to selecting the text                                                                                                                                                                         |

## Voice

- First person, active, plain English. "I built", not "Leveraged synergies".
- Say what it does for people before how it works ("releases 29 components automatically", not "GitOps pipeline with Kargo").
- At most one number per sentence; only real, verifiable numbers.
- Buttons say exactly what happens: "Hire me", "Download CV", "Read the case study".

## Accessibility

- Visible focus ring (2px accent, 3px offset) on every interactive element.
- Skip link, landmarks, one h1 per page, headings in order.
- Portrait has real alt text; decorative illustrations are `aria-hidden`.
- Stage buttons expose `aria-pressed`; the detail area is `aria-live="polite"`.
- Everything readable without JavaScript: stages render all content server-side, and the script only enhances.
