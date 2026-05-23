# Portfolio — Masterplan

> Single source of truth for porting `Mainul's Portfolio/` (static HTML/CSS/JS reference) into the production Next.js 16 / React 19 / SCSS-modules portfolio at the repo root. Every `_plans/*.md` + `_specs/*.md` we write from here on should trace back to a section in this document.

**Author:** Mainul Islam
**Last reviewed:** 2026-05-21
**Status of the codebase at masterplan time:** scaffold phase complete (Next.js 16 + React 19 + TS strict + SCSS modules + MDX wired). `app/page.tsx` is a placeholder. `app/_styles/*.scss` are TODO skeletons. No real UI exists yet.
**Source of truth for visuals/content:** `Mainul's Portfolio/` (read-only — never edit).

---

## 0. How to use this document

- **This is the masterplan, not a plan.** It does not get implemented directly. Every implementation cycle still goes through the `plan → spec → approve → implement` workflow defined in `CLAUDE.md`.
- For each phase below, when it's time to build it, write `_plans/<phase-name>-plan.md` (plain English) and `_specs/<phase-name>-spec.md` (file/component-level technical detail). Both must reference the matching section of this masterplan.
- Treat this document as living. If a phase's reality diverges materially from what's described here, update the masterplan and note the change at the bottom of the affected section in a `> **Amendment YYYY-MM-DD:** …` callout.
- Decisions captured here are defaults, not edicts. Anything can be overridden in a phase-specific plan with a stated reason — that's the whole point of having an explicit plan/spec step.

---

## 1. Project intent (the "why")

A personal portfolio for Mainul Islam — a frontend developer specialising in A/B testing and experimentation. The site has three jobs, in order:

1. **Establish credibility** with hiring managers and CRO/optimisation agency leads inside ~10 seconds of landing.
2. **Showcase three flagship case studies** — AvsB (own product), Kemon Doctor (own product, non-profit), and Client Experimentation Work (4+ years, 500+ tests).
3. **Make it trivial to start a conversation** — direct email, GitHub, resume PDF, and a short contact form with topic chips.

Secondary jobs:

- Demonstrate craft (typography, responsive design, accessibility) without saying "I have craft" anywhere on the page.
- Showcase the _idea of A/B testing as identity_: the hero literally has a Variant A / Variant B toggle, and a Tweaks panel lets the visitor change the accent colour. The site itself acts as a small experiment surface.
- Stand out from the average dev portfolio. The design language is editorial — closer to a print magazine cover than to a SaaS marketing page.

**What this site is NOT:**

- Not a blog. No CMS. No comments. No newsletter.
- Not a marketing funnel. No analytics, tracking pixels, popups, or "newsletter to download CV" gates.
- Not a CMS-backed system. Case studies are static MDX content authored in the repo. New case studies are PRs.

---

## 2. Information architecture

Five public routes plus shared chrome:

| Route                | Page                                | Source HTML             | Notes                                                                                                        |
| -------------------- | ----------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/`                  | Landing / index                     | `index.html`            | Hero, marquee, intro, stats, services, selected work (3), selected clients, recognition, experience, end CTA |
| `/work`              | Work index                          | `work.html`             | Filterable list of all projects (current + archive — 6 entries today)                                        |
| `/work/avsb`         | Case study — AvsB                   | `case-avsb.html`        | Authored as MDX                                                                                              |
| `/work/kemon-doctor` | Case study — Kemon Doctor           | `case-kemondoctor.html` | Authored as MDX                                                                                              |
| `/work/client`       | Case study — Client experimentation | `case-client.html`      | Authored as MDX                                                                                              |
| `/about`             | About                               | `about.html`            | Bio, skills grid, experience, personal, resume CTA                                                           |
| `/contact`           | Contact                             | `contact.html`          | Direct lines, form (with topic chips + Zod validation + email send), FAQ                                     |

**Shared on every page:**

- `<Nav>` — fixed top bar with logo + 4 links + mobile hamburger drawer
- `<Footer>` — large mailto CTA + meta links + huge "Mainul" stroked wordmark + legal/version line
- `<CustomCursor>` — fine-pointer-only, accent-coloured dot that expands to a ring on interactive elements
- `<Reveal>` — IntersectionObserver-driven `.is-inview` toggle for staged scroll reveals

**Home-only:**

- `<TweaksPanel>` — fixed bottom-right, lets visitor swap the accent colour (5 presets) and the hero variant (A/B). State persisted to `localStorage`.

`/work/*` MDX pages get a thinner navigation context (breadcrumb back to `/work`) and a `<NextCase>` pager at the bottom.

---

## 3. Design system

Pulled from `Mainul's Portfolio/assets/shared.css`. These are the canonical tokens — every component reads them, no literal values in component SCSS.

### 3.1 Colour

| Token           | Value                  | Use                                                                                     |
| --------------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `--bg`          | `#f5f0ec`              | Warm cream — page background                                                            |
| `--fg`          | `#0a0908`              | Near-black ink — primary text + filled buttons                                          |
| `--fg-soft`     | `rgba(10, 9, 8, 0.78)` | Body copy on secondary surfaces                                                         |
| `--fg-muted`    | `rgba(10, 9, 8, 0.56)` | Meta / labels / dates                                                                   |
| `--rule`        | `rgba(10, 9, 8, 0.14)` | Hairline rules                                                                          |
| `--rule-strong` | `rgba(10, 9, 8, 0.32)` | Section dividers, card borders                                                          |
| `--paper`       | `#ece6e0`              | Slightly darker cream for cards                                                         |
| `--paper-deep`  | `#e3dcd4`              | Hover state for paper                                                                   |
| `--accent`      | `#1f3a5f` (default)    | Deep ink-navy — restrained editorial accent. **Swappable at runtime** via Tweaks panel. |
| `--accent-ink`  | `#ffffff`              | Text colour on accent backgrounds                                                       |

**Accent presets** (Tweaks panel swatches, in order):

1. `#1f3a5f` — Ink navy (default)
2. `#2e5a3e` — Forest
3. `#7a2e2e` — Burgundy
4. `#b88a30` — Mustard
5. `#0a0908` — Mono (no accent — uses `--fg`)

Persisted in `localStorage` under key `mn-accent-v2`. **Important:** the v2 suffix is intentional — bumping it invalidates any legacy "orange" values from earlier portfolio iterations. Keep the v2 suffix.

**Dark mode:** out of scope for v1. If added later, use `data-theme="dark"` on `<html>` with `:root[data-theme='dark'] { … }` overrides in `globals.scss`. No system-preference auto-switch (the cream is part of the brand).

> **Amendment 2026-05-23 (Phase 7):** the runtime accent switcher described above is **dropped from scope**. The `--accent` CSS variable stays fixed at `#1f3a5f` (ink navy) on every page. The 5-preset list and the `mn-accent-v2` localStorage convention are no longer planned — the accent is part of the design language, not a configurable user setting. The Variant A/B hero toggle (`§ 2 home-only`) is unaffected and stays. See `_plans/polish-and-launch-plan.md` for rationale.

### 3.2 Typography

Three families, all loaded via `next/font/google` in `app/layout.tsx`. Already wired in scaffold.

| Token            | Family         | Weights | Use                                                         |
| ---------------- | -------------- | ------- | ----------------------------------------------------------- |
| `--font-display` | Teko           | 300–700 | All display sizes, headings, big numerals                   |
| `--font-body`    | Josefin Sans   | 300–600 | Body copy, paragraphs, form inputs                          |
| `--font-mono`    | JetBrains Mono | 400–600 | Labels, meta, section indices, mono captions, tags, buttons |

Root font size is `62.5%` so `1rem = 10px`. Body base is `1.7rem` / line-height `1.45`.

**Display scale** (Teko, weight 500, uppercase, line-height ~0.85):

| Class         | Clamp values                   | Use                     |
| ------------- | ------------------------------ | ----------------------- |
| `.display-xl` | `clamp(8.4rem, 17vw, 27rem)`   | Hero, page-intro titles |
| `.display-lg` | `clamp(6.4rem, 11vw, 17rem)`   | Case hero variants      |
| `.display-md` | `clamp(4.6rem, 7.5vw, 11rem)`  | Section heroes          |
| `.display-sm` | `clamp(3.6rem, 5.2vw, 8rem)`   | Sub-headers             |
| `.display-xs` | `clamp(2.6rem, 3.6vw, 5.4rem)` | Card titles             |

Display variants:

- `.outline` — text becomes transparent with a `1.2px var(--fg)` stroke. Used on the hero ("& Experiments") and case heroes.
- Display sizes are **clamped down further** at 1100px, 900px, 640px, and 380px breakpoints — see `shared.css:606–790`. The scaffolded `_typography.scss` partial must port every breakpoint.

**Mono captions:**

- `.mono` — `1.15rem`, `letter-spacing: 0.08em`, uppercase, weight 500
- `.mono-sm` — `1.05rem`, `letter-spacing: 0.06em`

**Body copy:**

- `body` — `1.7rem`, line-height `1.45`
- `.lede` — `clamp(1.9rem, 2.1vw, 2.8rem)`, weight 300, max-width 58ch
- `p` — max-width 64ch, margin-bottom 1.6rem
- `p.large` — `clamp(1.8rem, 1.9vw, 2.4rem)`

### 3.3 Layout primitives

| Token         | Value                      | Use                     |
| ------------- | -------------------------- | ----------------------- |
| `--container` | `1640px`                   | Max container width     |
| `--gutter`    | `clamp(20px, 4vw, 64px)`   | Horizontal page padding |
| `--section-y` | `clamp(80px, 12vw, 200px)` | Section vertical rhythm |

- `.container` — `max-width: var(--container)`, centered, `padding: 0 var(--gutter)`
- `.container--narrow` — `max-width: 1100px` (FAQ on Contact page)
- `.section` — `padding: var(--section-y) 0`

At ≤900px, `--section-y` shrinks to `clamp(60px, 10vw, 140px)`. At ≤640px, it pins to `52px` and `--gutter` to `22px`. At ≤380px, `--gutter` drops to `18px`.

### 3.4 Motion

| Token           | Value                            | Use                         |
| --------------- | -------------------------------- | --------------------------- |
| `--ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)` | Default transitions         |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Loops (scroll bar, marquee) |

**Named animations** (port to `_mixins.scss`/`globals.scss` keyframes block):

- `rise` — hero h1 chars translate from 110% Y to 0
- `fade-in` — opacity 0 → 1 (used on badge + variant toggle)
- `nav-pulse` — logo dot, status dot, form-head dot (scale 1 → 1.4, opacity 1 → 0.65)
- `spin` — award seal dashed ring (30s linear infinite)
- `marquee` — `translateX(0)` → `translateX(-50%)` (38s linear infinite)
- `scroll-bar` — gradient position pulse (2s ease-in-out infinite)

**`prefers-reduced-motion: reduce`** must disable: marquee, spin, rise, nav-pulse pulsing, and reveal-on-scroll transforms (reveals stay visible but skip the translate/opacity tween). The static template does NOT respect this — porting it is a hard requirement, see `accessibility.md` rule "Respect `prefers-reduced-motion`".

### 3.5 Buttons & links

| Class          | Look                                         | Hover                                           |
| -------------- | -------------------------------------------- | ----------------------------------------------- |
| `.btn`         | Black pill, mono text, 18px/28px padding     | Accent slides up from bottom; arrow shifts +4px |
| `.btn--ghost`  | Transparent + 1px `--fg` border              | Same accent slide                               |
| `.btn--accent` | Accent background, white text                | Black slides up                                 |
| `.tlink`       | Underlined text link with arrow + hover lift | Text + border turn accent                       |

### 3.6 Decorative motifs

- **`.tick-rule`** — 21 vertical hairline ticks across a horizontal rule (every 5th tick is taller + darker). Used in the hero topbar. Implement as `<span>` × 21 inside a `<div class="tick-rule">` with the strong-tick selector being `:nth-child(5n + 1)`.
- **Stroked giant wordmark** — the footer renders the full word "Mainul" as a 24vw-tall transparent letter with a 1.5px stroke. Implement with `-webkit-text-stroke`.
- **Award seal** — 84px circle with dashed rotating ring around it (30s spin). Used twice on the home page.
- **Custom cursor** — 10px accent dot that grows to a 56px transparent ring on hover over `a, button, [data-cursor="hover"]`. Pointer-fine + hover-hover media query only (touch devices never see it).

### 3.7 Reveal-on-scroll

Vanilla IntersectionObserver: when `.reveal` enters viewport (threshold 0.12, rootMargin `0px 0px -8% 0px`), add `.is-inview`. The class transitions opacity 0 → 1 and translateY 28px → 0 over 1s with `--ease-out`. Staggered via `data-delay="1"` … `data-delay="5"` (each step +80ms).

Port as a thin `<Reveal>` client component or a custom hook attached to a parent (`useReveal()` walking children with the class). Recommended approach: **single mount-level effect that observes every `.reveal` in the DOM**, identical to the static template, so child components can keep using plain class names without wiring per-component refs. Decision deferred to the phase-3 spec.

---

## 4. Asset inventory & porting strategy

### 4.1 Images present in the template

```
Mainul's Portfolio/screenshots/
├── hero-bottom.png   (28KB)  ── duplicate of hero-bottom2.png/hero-fixed.png
├── hero-bottom2.png  (28KB)
├── hero-fixed.png    (28KB)
├── hero-desktop.png  (22KB)
├── hero-full.png     (22KB)  ── duplicate of hero-desktop.png/hero-zoom.png
├── hero-mobile.png   (21KB)
└── hero-zoom.png     (22KB)

Mainul's Portfolio/uploads/
├── Screenshot 2026-05-17 at 3.31.39 PM.png  (563KB)  ── design reference, do not ship
├── Screenshot 2026-05-17 at 4.03.05 PM.png  (377KB)  ── design reference, do not ship
├── pasted-1779012176832-0.png               (109KB)  ── design reference, do not ship
└── pasted-1779013325109-0.png               (137KB)  ── design reference, do not ship
```

**These hero PNGs are not actually used by the static template.** A grep across `index.html`, `about.html`, `work.html`, `contact.html`, and the three case pages shows ZERO `<img src="screenshots/...">` references. They're dev scratch.

**The only image referenced anywhere is `https://avatars.githubusercontent.com/u/57148171?v=4`** — the GitHub avatar on `/about`, hot-linked. The masterplan moves this to a self-hosted `public/me.jpg` (or `.webp`) served through `next/image`. Tracked in `futureWorks.md:25` as "self-host the GitHub avatar."

**Decision:** the duplicate hero PNGs do not get ported. The screenshots/ + uploads/ folders stay in `Mainul's Portfolio/` as reference only. The only assets that land in `/public` are:

- A self-hosted portrait (`me.jpg` or `me.webp`, square-cropped 1024×1024 source)
- A favicon set (16×16, 32×32, apple-touch 180×180, SVG mark)
- An OG image (1200×630, derived from the hero treatment)
- The resume PDF, self-hosted as `/cv.pdf` (currently the template hot-links to Google Drive)

Case-study screenshots (`case-visual` placeholder slots in the template) are **TBD** — each case page in the template renders an empty `case-visual` placeholder with a label like "Dashboard · in-progress". Real screenshots get added per case study as they become available. Until then, the placeholder treatment ships.

### 4.2 Iconography

There are no icon files. Every glyph is either:

- An inline SVG (arrows, primarily the `M5 12h14M13 5l7 7-7 7` line-arrow on work rows, case meta, contact direct lines, "next case" pager)
- A unicode character (`↗`, `↓`, `→`)
- An emoji or styled span

Port the SVG arrow as a single `<Arrow>` component with size + stroke props. Don't sprinkle the same `<svg>` markup across 12 files.

### 4.3 Fonts

Already self-hosted via `next/font/google` in `app/layout.tsx`. No changes needed in phase 2 beyond verifying the rendered weights match the template (Teko 500 dominates display, JosSans 300/400/500 for body, JBMono 400/500/600 for labels).

---

## 5. Component inventory

The static template is structured around ~20 distinct UI patterns. Below is the canonical decomposition for the Next.js port.

### 5.1 Universal primitives → `app/_components/`

These are reused across multiple pages. Each gets a folder: `<Name>/<Name>.tsx` + `<Name>/_<Name>.module.scss`.

| Component      | Source markup                                                    | Notes                                                                                 |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Nav`          | `<nav class="nav">` in every page                                | Fixed top, scrolled state + mobile drawer. Active link computed from `usePathname()`. |
| `Footer`       | `<footer class="footer">` in every page                          | Variants per page (heading copy differs); pass `heading` + `metaLinks` as props.      |
| `Button`       | `.btn`, `.btn--ghost`, `.btn--accent`                            | `variant="default" \| "ghost" \| "accent"`, `href` for links, `arrow` slot.           |
| `TextLink`     | `.tlink`                                                         | Inline text link with underline + arrow.                                              |
| `Arrow`        | SVG `M5 12h14M13 5l7 7-7 7`                                      | `size?: number`, `strokeWidth?: number`. Render `aria-hidden` by default.             |
| `Container`    | `.container` / `.container--narrow`                              | `<div class="container">` wrapper; `narrow` prop for the 1100px variant.              |
| `Section`      | `.section`                                                       | Wraps content with `padding: var(--section-y) 0`. Optional `firstChild` to drop top.  |
| `SectionHead`  | `.section__head` + `.section__index` + `.section__title`         | Pair of mono index label + display heading with accent dot.                           |
| `PageIntro`    | `.page-intro` block on /work, /about, /contact (and case heroes) | Big display title + mono label + optional sub-paragraph.                              |
| `Reveal`       | `.reveal` + `.is-inview`                                         | Wrapper that adds the class + a `data-delay` for stagger.                             |
| `TickRule`     | `.tick-rule` + 21 `<span>` marks                                 | Decorative; render `aria-hidden`.                                                     |
| `CustomCursor` | Injected by `shared.js` on fine-pointer devices                  | Mounted in root layout, client component, conditional on media query.                 |
| `MonoLabel`    | `.mono` / `.mono-sm`                                             | Small wrapper for consistent typography on stat labels, dates, etc.                   |
| `Tag`          | `.case-block__tags > span`, `.service__tags > span`              | Rounded pill, mono uppercase.                                                         |

### 5.2 Home-only sections → `app/_components/home/`

Each section lives flat in the home folder (single-file `.tsx`) unless it has its own styles or sub-components (then folder).

| Component         | Source DOM section                  | Notes                                                                                       |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `Hero`            | `<header class="hero">`             | Topbar grid + display title + variant toggle + sub + status + scroll cue.                   |
| `HeroVariant`     | inside `Hero`                       | Two slots (A/B) with rise-in spans; controlled by `<TweaksPanel>` + inline buttons.         |
| `HeroBadge`       | `.hero__badge` ("A/B Testing" pill) | Slight rotation, click-to-cycle variant.                                                    |
| `Marquee`         | `.marquee`                          | Infinite horizontal scroll of disciplines + accent words. Two duplicated tracks.            |
| `Intro`           | `.intro__grid`                      | Sticky mono label on the left, body copy with accent inline.                                |
| `Stats`           | `.stats` × 3 `.stat`                | 500+ tests, 7 yrs, 6 countries. Numbers animate when in view (count-up).                    |
| `Services`        | `.services` × 3 `.service`          | A/B testing, Frontend, Product. Hover changes bg to `--paper`.                              |
| `SelectedWork`    | `.work-list` × 3 `.work-row`        | Title transforms on hover, color sweep from bottom, arrow rotates -45deg.                   |
| `SelectedClients` | `.client-grid` × 8 `.client`        | 4×2 grid (collapses to 2×4 on tablet, 1×8 on phone). 8 clients listed.                      |
| `Recognition`     | `.awards` × 2 `.award`              | Two BestCSS / DesignNominees SOTD features. Dashed rotating seal.                           |
| `Experience`      | `.xp-list` × 2 `.xp-row`            | Year + role + description + location grid.                                                  |
| `EndCTA`          | `.endcta`                           | Mega "Let's build something measurable." with outlined middle word.                         |
| `TweaksPanel`     | `<aside class="tweaks">`            | Home-only. Floating black pill: 5 accent swatches + A/B toggle. Mobile collapses to a chip. |

### 5.3 Work index → `app/work/`

| Component  | Source DOM section | Notes                                                                                   |
| ---------- | ------------------ | --------------------------------------------------------------------------------------- |
| `Filters`  | `.filters` row     | All / Products / Experimentation / Client work pill buttons. Updates visible row count. |
| `IndexRow` | `.index__row`      | One row per project. Title slides + recolours on hover; arrow rotates.                  |

The 6 projects today (preserve order): AvsB, Kemon Doctor, Client Experiments, Flatwhite, Crypto Gods, Pascal. The latter three currently link to `case-client.html` (no dedicated case study). Decision for the port: **link them to `/work/client#flatwhite` etc.** with anchor jumps, or **render minimal stub case pages for each**. Default proposal: anchor jumps for now; promote to full case pages if/when there's content to fill them. Captured for the work-index phase plan.

### 5.4 Case studies → `app/work/[case]/page.mdx` (+ shared `_components/case/`)

Three case studies as **MDX** authored in the repo. The MDX renders inside a shared layout (`app/work/[case]/layout.tsx` or a single `<CaseLayout>` wrapping each page).

| Component     | Source DOM section                        | Notes                                                                                                                         |
| ------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CaseHero`    | `.case-hero`                              | Breadcrumb (Work / `nn — Name`), display title with accent + outlined lines, summary, meta.                                   |
| `CaseMeta`    | `.case-meta` (4-col grid)                 | Role / Type / Year / Status (with dot indicator).                                                                             |
| `CaseBlock`   | `.case-block`                             | Two-column: sticky mono label (`<span class="num">01</span>Overview` + display "What it is.") on left, body content on right. |
| `CaseVisuals` | `.case-visuals` / `.case-visuals--triple` | 1-tall + 1-short, or triple. Placeholder slot with striped fill + mono caption. Real screenshots replace per case.            |
| `CodeMock`    | `.code-mock` (AvsB case only)             | Dark terminal block with prompt lines, color-coded tokens.                                                                    |
| `NextCase`    | `.next-case`                              | Pager at end of case page. Label + giant title + arrow.                                                                       |
| `Countries`   | `.countries` (Client case only)           | 6-col flag + country grid (collapses 2×3 on phone).                                                                           |

**MDX components map** lives in `mdx-components.tsx` at repo root (already created in scaffold). Override:

- `img` → `next/image` with explicit width/height pulled from frontmatter
- `a` → `next/link` for internal links, plain `<a>` with `target="_blank" rel="noopener noreferrer"` for external
- Inject the case primitives (`CaseHero`, `CaseBlock`, `CaseVisuals`, `CodeMock`, `NextCase`) as globally-available components, so case MDX can use them without per-file imports.

### 5.5 About page → `app/about/`

| Component     | Source DOM section                                 | Notes                                                                                                             |
| ------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `AboutHero`   | Uses shared `PageIntro` with two-line accent title | "A frontend dev, measuring his work."                                                                             |
| `AboutBio`    | `.about-bio` (left side + right body)              | Sticky portrait + Currently/Focus cards on left, ~5-paragraph bio on right.                                       |
| `AboutAvatar` | `.about-bio__avatar`                               | Striped fill background, self-hosted portrait, "Mainul Islam, 2026" tag, border inset.                            |
| `AboutCard`   | `.about-bio__card`                                 | Small paper-coloured card with mono label + display value.                                                        |
| `Skills`      | `.skills` grid                                     | 5 groups (Core, Styling, Experimentation, Tooling, Also working with). Tags as display text divided by hairlines. |
| `Experience`  | (re-uses home component)                           | Identical to home.                                                                                                |
| `Personal`    | `.personal`                                        | Short outside-of-code paragraph.                                                                                  |
| `ResumeCTA`   | `.resume`                                          | Black card with display heading, accent CV background letter, download button.                                    |

### 5.6 Contact page → `app/contact/`

| Component      | Source DOM section      | Notes                                                                      |
| -------------- | ----------------------- | -------------------------------------------------------------------------- |
| `ContactAside` | `.contact-aside`        | "Direct lines." heading + body + `Direct` list (email/GitHub/CV).          |
| `DirectLink`   | `.direct`               | Row with mono label + display value + arrow; hovers inset + accent.        |
| `ContactForm`  | `.form`                 | Real form. Topic chips (radio behaviour), 4 fields, submit, success state. |
| `TopicChips`   | `.form__chips`          | Acts as a single-select radio group; writes to hidden `topic` input.       |
| `FAQ`          | `details.faq__item` × 4 | Native `<details>` with custom plus-to-cross marker.                       |

**Form backend** is a phase-7 decision. Today the static template fakes the submit with JS. Options for the Next.js port:

- **Resend** (transactional email via API; ~$0/month at this volume)
- **Formspree** (no-code form endpoint)
- A custom `app/api/contact/route.ts` handler that calls Resend, validates with Zod, and rate-limits with a simple in-memory or Upstash counter

Default proposal: **`app/api/contact/route.ts` → Zod-validated → Resend → `process.env.CONTACT_FROM` & `process.env.CONTACT_TO` & `process.env.RESEND_API_KEY`**. Rate-limit deferred to a v2 (start with no rate-limit, monitor for abuse). Captured for the contact phase plan.

---

## 6. Page-by-page content inventory

Every line of copy, label, link, and number is captured here so the port doesn't drift from the source.

### 6.1 `/` (Landing)

**`<head>` metadata:**

- Title: `Mainul Islam · Frontend Developer · A/B Testing & Experimentation`
- Description: `Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.`

**Nav links (order):**

1. Index — `/`
2. Work — `/work`
3. About — `/about`
4. Contact — `/contact`

**Hero topbar:**

- Left: `**Mainul Islam** · Frontend Developer`
- Centre: tick rule (21 marks)
- Right: `Portfolio v3 · 2026` / `**7 yrs · 6 countries**`

**Hero variant A (default):**

- Line 1 — "Frontend"
- Line 2 — "Developer" (indented `clamp(40px, 8vw, 160px)`) + A/B Testing badge (rotated -2deg, hover untilts)
- Line 3 — "& Experiments" (outlined)

**Hero variant B:**

- Line 1 — "Turning"
- Line 2 — "Traffic into" (indented)
- Line 3 — "Revenue." (in accent)

**Variant toggle:** small black pill: "● Variant A" / "● Variant B". Clicking the hero badge also cycles.

**Hero sub:** "I build and run experiments that turn traffic into revenue — 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript."

**Hero status:** "● Available for new A/B testing & frontend projects" + black pill button "Get in touch →" → `/contact`.

**Marquee items** (looped twice): `A/B Testing · Conversion Optimization · Optimizely · Kameleoon · Qubit · Next.js · TypeScript · Experimentation` (with `Conversion Optimization` and `Experimentation` in accent).

**Intro:**

- Label: "— Introduction" / "01 / Index" (in accent)
- Body: 3 paragraphs (see `index.html:1021–1024` for exact wording)

**Stats (3):**

- 500+ A/B tests & experiments shipped
- 7 Years building for the web
- 6 Countries worked with

**Services (3):**

- [01] A/B Testing & Experimentation — tags: Optimizely, Kameleoon, Qubit, CRO
- [02] Frontend Development — tags: Next.js, React, TypeScript, SCSS
- [03] Product Building — tags: Architecture, PostgreSQL, Drizzle

**Selected work (3):**

- 01 AvsB — "An in-house, CLI-driven A/B testing platform — built from scratch." Tags: Next.js · TypeScript · ClickHouse · Product
- 02 Kemon Doctor — "A non-profit platform helping patients in Bangladesh find trustworthy doctors." Tags: Next.js 15 · PostgreSQL · Drizzle · Solo
- 03 Client Work — "4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients." Tags: JavaScript · SCSS · Optimizely · Kameleoon

→ "View full work index ↗" link to `/work`

**Selected clients (8):** The Times, G-Star RAW, Motorway, Unity, IronmongeryDirect, WaterAid, AdBlock, Deel. Each with a sector label above.

**Recognition (2):**

- BestCSS.in — Site of the Day — Dec 2021 — links to `https://www.bestcss.in/user/detail/MainulIslamsPortfolio-26452`
- Design Nominees — Site of the Day — Nov 2021 — links to `https://www.designnominees.com/sites/mainul-islams-portfolio`

**Experience (2):**

- 2022–2026 — Frontend Developer (A/B Testing) @ Conversion.com — Remote · UK
- 2019–Present — Freelance Frontend Developer — Remote · 6 countries

**End CTA:** "Let's / **build something** (outlined) / measurable." + body "Now taking on new clients. If you have a frontend build or an experimentation programme in mind, I'd love to hear about it." + accent button "Start a conversation →" → `/contact`.

**Footer:** "Say hello — m.main2402@gmail.com" + meta links (GitHub, Resume/CV, Email) + huge "Mainul" wordmark + © 2026 · Frontend · Experimentation · v3 · Built with care.

### 6.2 `/work`

**Title:** `Work · Mainul Islam`
**Description:** `A mix of experimentation platforms, products, and client experiment work.`

**Page intro:**

- Label: `02 / Work Index`
- Title: "Work, / in detail." (second line in accent)
- Sub: "A mix of experimentation platforms, products, and client experiment work — spanning startups and individuals across six countries."

**Filters:** All / Products / Experimentation / Client work — with a "06 projects" counter that updates on filter.

**Rows (6):**

1. AvsB — `product experimentation` — Next.js · TS · ClickHouse — 2025 · In progress → `/work/avsb`
2. Kemon Doctor — `product` — Next.js 15 · Postgres · Drizzle — 2025 · In progress → `/work/kemon-doctor`
3. Client Experiments — `experimentation client` — Optimizely · Kameleoon · Qubit — 2019 – Present → `/work/client`
4. Flatwhite — `client` — HTML · SCSS · XD to code — 2020 · Romania → `/work/client#flatwhite` (or stub page TBD)
5. Crypto Gods — `client` — HTML · SCSS · Bootstrap — 2020 → `/work/client#crypto-gods`
6. Pascal — `client` — React · SCSS — 2021 · Canada → `/work/client#pascal`

**Footer line:** "Client names appear only with written permission. Anything not listed here stays confidential — that's how this work has to work."

### 6.3 `/work/avsb`

**Title:** `AvsB — Experimentation Platform · Mainul Islam`
**Description:** `An in-house, CLI-driven A/B testing platform — built from scratch.`

**Hero:**

- Breadcrumb: Work / `01 — AvsB`
- Title: "AvsB. / **Experiments,** (outlined) / in code."
- Summary: "An in-house experimentation platform — similar in spirit to Optimizely, but CLI-driven and built for developers who want to write and manage experiments directly in code."

**Meta (4):** Role: Sole developer / Type: Own product / Year: 2025 – Present / Status: ● In progress

**Blocks (6):**

1. Overview / What it is.
2. My role / What I did.
3. The problem / What it solves.
4. _(Visual block — code-mock terminal + dashboard placeholder)_
5. What I built / The approach.
6. Stack / Tools used. — Tags: Next.js, TypeScript, ClickHouse, Cloudflare R2, Node.js (CLI), SCSS
7. Outcome / Status. — ● In progress

Exact copy in `case-avsb.html`. The code-mock content (lines 141–152 in source) ports verbatim with token-coloured spans.

**Next case:** → `/work/kemon-doctor`

### 6.4 `/work/kemon-doctor`

**Title:** `Kemon Doctor — Doctor Review Platform · Mainul Islam`
**Description:** `A non-profit platform helping patients in Bangladesh find trustworthy doctors.`

**Hero:**

- Breadcrumb: Work / `02 — Kemon Doctor`
- Title: "Kemon / **Doctor.** (accent) / **For real trust.** (outlined)"
- Summary: "_Kemon Doctor_ means _How is the doctor?_ — a non-profit platform helping patients in Bangladesh find reliable doctors and surface issues like over-prescribing."

**Meta (4):** Solo founder & developer / Non-profit product / 2025 – Present / ● In progress

**Blocks (6):** Overview, My role, The problem, _(triple visual: Search · mobile, Doctor profile, Review flow)_, What I built, Stack (Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, Tailwind CSS, Vercel), Outcome.

> **Note:** the Stack tag "Tailwind CSS" is on the Kemon Doctor case but **not** in this portfolio's actual stack — it's accurate for the Kemon Doctor project, where Mainul did use Tailwind. Keep the listing as-is; don't drift toward homogenisation.

**Next case:** → `/work/client`

### 6.5 `/work/client`

**Title:** `Client Experimentation Work · Mainul Islam`
**Description:** `4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients.`

**Hero:**

- Breadcrumb: Work / `03 — Client Experimentation Work`
- Title: "Client / **experiments,** (outlined) / **at scale.** (accent)"
- Summary: "Four-plus years and **500+ A/B tests shipped** on enterprise platforms — checkout-flow experiments, layout tests, and conversion optimization for ecommerce and SaaS clients."

**Meta (4):** Frontend dev on testing / Client work / 2019 – Present / 6 countries + counting

**Blocks (6):** Overview, _(country grid: UK, IN, SK, AT, AU, CA)_, My role, How I work, Stack (JavaScript, SCSS, Optimizely, Kameleoon, Qubit, Browser DevTools), Outcomes (intentional empty — "Honesty is the point of this section. Real numbers land here only once a client signs off on sharing them. No exceptions."), Confidentiality (with ghost button "Talk about a new project →" → `mailto:`).

**Next case:** wraps back to → `/work/avsb` (label: "Back to · 01")

### 6.6 `/about`

**Title:** `About · Mainul Islam`
**Description:** `Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.`

**Page intro:**

- Label: `03 / About`
- Title: "A frontend dev, / measuring his work." (line 2 in accent)

**Bio:**

- Sidebar (sticky): striped portrait (1024px self-hosted, fallback striped fill) with "Mainul Islam, 2026" tag pill + "Currently: Available for new projects (accent)" card + "Focus: A/B Testing & Frontend" card.
- Body: 5 paragraphs (`about.html:314–319`).

**Skills (5 groups):**

- Core — JavaScript, TypeScript, React, Next.js
- Styling — SCSS, Tailwind, Modern CSS
- Experimentation — Optimizely, Kameleoon, Qubit, CRO
- Tooling & Testing — Vitest, Playwright, Git, Turborepo
- Also working with — PostgreSQL, Drizzle ORM, Node.js, ClickHouse

**Experience:** identical to home (same two rows).

**Personal:** "Outside of code." heading + "Outside of work I run a YouTube channel for quiet travel videos. I'm drawn to mountains and the sea — anywhere a little further from the screen."

**Resume CTA:** "Want the / full CV?" + body + "Download resume ↓" → currently `https://drive.google.com/file/d/1zp7JQLgPNyEQan9bzKnLN2i-t1Du_tgI/view`. Phase-7: replace with self-hosted `/cv.pdf`.

### 6.7 `/contact`

**Title:** `Contact · Mainul Islam`
**Description:** `Available for new A/B testing and frontend projects. Send a message or email directly.`

**Page intro:**

- Label: `04 / Contact`
- Title: "Let's work / together." (line 2 in accent)
- Sub: "Available for new A/B testing and frontend projects. Send me a message or email me directly — I usually reply within a day or two."

**Direct lines:**

- Email → `mailto:m.main2402@gmail.com` — display value "m.main2402@gmail.com"
- GitHub → `https://github.com/main1479` — display value "@main1479"
- Resume → Google Drive (→ phase-7 swap to `/cv.pdf`) — display value "Download CV"

**Form fields:**

1. Name (text, required)
2. Email (email, required)
3. Topic (chips, required-ish): A/B testing / Frontend build / Product work / Something else
4. Message (textarea, min 140px tall, required)

Submit note: "↳ I usually reply in 1–2 days"
Success state: "Message sent." + body + ghost button "See the work" → `/work`.

**FAQ (4):**

1. What kind of projects are you taking on?
2. Do you work with agencies or only end clients?
3. How do you charge?
4. What time zone do you work in?

Each with the exact answer in `contact.html:460–474`.

---

## 7. Interactions & behaviour

A consolidated checklist of everything the JS in the template does, ported as React hooks/effects.

| Behaviour                      | Source                          | Port                                                                                                                            |
| ------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Reveal-on-scroll               | `shared.js:9–24`                | `useReveal()` effect in a top-level client wrapper or per-section.                                                              |
| Nav scrolled state             | `shared.js:26–34`               | `useScroll` (window listener) toggles `.scrolled` class on the fixed nav.                                                       |
| Mobile hamburger drawer        | `shared.js:36–58`               | Client component in `<Nav>` with `useState(open)`, `body.style.overflow` lock, Escape to close, link-click to close.            |
| Custom cursor                  | `shared.js:60–89`               | `<CustomCursor>` mounted in layout, conditional on `matchMedia("(hover: hover) and (pointer: fine)")`.                          |
| Accent persistence             | `shared.js:91–96`               | `useAccent()` hook: reads `mn-accent-v2` on mount, applies as `--accent` inline style on `<html>`.                              |
| Hero variant toggle            | `index.html:1345–1387`          | `useVariant()` state in `<Hero>`; toggling restarts entrance animations (manage by toggling a class + key prop).                |
| Tweaks panel: accent + variant | `index.html:1389–1407`          | `<TweaksPanel>` shares state with `<Hero>` via a small context (`HomeStateContext`) or React state lifted to `app/page.tsx`.    |
| Tweaks panel: mobile collapse  | `shared.js:99–108`              | Client component manages `.is-open` on tap of pseudo-chrome.                                                                    |
| Stats count-up animation       | `index.html` `data-count="500"` | IntersectionObserver hook that animates from 0 → target over ~1.4s with easing.                                                 |
| Work index filters             | `work.html:285–303`             | `<Filters>` updates a state filter; rows show/hide via state, count updates.                                                    |
| Contact form: chip selection   | `contact.html:503–511`          | Single-select chip group; updates a hidden `topic` form value.                                                                  |
| Contact form: submit           | `contact.html:513–522`          | **Real submit** — POST to `/api/contact`; render success block on 200. Loading state during fetch. Error state on 4xx/5xx.      |
| Contact form: clear            | `contact.html:524–528`          | Reset all fields + clear active chip + clear hidden topic.                                                                      |
| FAQ accordions                 | `contact.html:459–474`          | Native `<details>` — no JS needed. CSS animates the plus → cross.                                                               |
| Honor `prefers-reduced-motion` | (not in template)               | **New requirement.** Wrap non-essential transitions in `@media (prefers-reduced-motion: no-preference)` per `accessibility.md`. |

---

## 8. Accessibility checklist

`.claude/rules/accessibility.md` is the canonical rulebook. The port must hit every requirement. Key call-outs for this design:

- **Hero variant toggle** uses `role="tablist"` + buttons with `role="tab"` + `aria-selected`. Hidden panel uses `hidden` attribute (`[hidden]` baseline CSS, not `display: none` overrides).
- **Tweaks panel** is `<aside aria-label="Tweaks">` with swatches as `<button aria-label="Ink navy">` etc. Mobile collapse needs `aria-expanded` on the toggle target.
- **Custom cursor** has `pointer-events: none` and never replaces the system cursor — the native cursor stays visible for all keyboard/screen-reader users (the custom one is only on `hover: hover` + `pointer: fine`).
- **Animated outline text** — the stroked title is decorative; check contrast still hits AA against the cream background (with `--fg` stroke at 1.2–1.5px, this passes on cream but **fails on the dark footer** for the giant wordmark. The footer wordmark is `aria-hidden="true"`, so it's decorative — OK.).
- **Mobile drawer** must trap focus when open, return focus to the toggle on close, close on Escape, and not flicker the page underneath.
- **Form labels** must be visible, not just `placeholder`. The static template already does this (`<label for="name">…`).
- **Form validation** must be on submit (not on blur) and must use accessible error messaging (`aria-describedby` pointing to a `[role="alert"]` region per field). The static template currently does nothing — the Next.js port adds Zod validation and accessible errors.
- **Reveal-on-scroll** must not hide content from screen readers. Start with `opacity: 0; transform: translateY(28px)` but ensure the content is still in the DOM and reachable. Reduce to `opacity: 1; transform: none` when `prefers-reduced-motion: reduce`.
- **Heading order** per page: one `<h1>`, then `<h2>` for section titles, `<h3>` for cards/rows. The static template gets this right; keep it.
- **Touch targets** ≥44×44 CSS pixels — all primary buttons already pass; verify the cursor-only filter pills don't get below this on phone.
- **Lighthouse a11y target:** 100. Run after every page port.

---

## 9. Responsive strategy

Breakpoints (from `shared.css:606–790`):

| Breakpoint | Trigger                                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤1100px    | Laptop-portrait: tighten display sizes; drop `.nav__link .num` prefix; shrink nav link gap.                                                                                                                                                                                              |
| ≤900px     | Tablet: `--section-y` shrinks; nav padding/font shrinks; multi-column grids collapse to 1 or 2 cols.                                                                                                                                                                                     |
| ≤768px     | Form `field__row` becomes single column.                                                                                                                                                                                                                                                 |
| ≤700px     | Stats grid collapses to single column.                                                                                                                                                                                                                                                   |
| ≤640px     | Phone: `--gutter` to 22px, `--section-y` to 52px. Body font drops to 1.5rem. Mobile nav drawer activates. Tweaks panel collapses. Custom cursor disabled.                                                                                                                                |
| ≤380px     | Very small phones: further token tightening.                                                                                                                                                                                                                                             |
| ≤320px     | Smallest supported width (iPhone SE 1st-gen, older Android). Final guardrail: `--gutter` ≤ 16px, display sizes clamp-floor to never overflow, badge/chip text never wraps mid-word, nav drawer + tweaks chip remain reachable with one thumb. Hard QA baseline — nothing may break here. |

Every component module must port the breakpoints that affect it. **Do not** rely on container queries — the design predates them and the source uses width-based queries throughout. Container queries can be introduced later as an enhancement, not a baseline.

---

## 10. Phase plan — order of work

Each phase below becomes its own `_plans/<phase>-plan.md` and `_specs/<phase>-spec.md` cycle. Phases are sequenced so each unblocks the next.

### Phase 2 — Design tokens & shared SCSS partials

**Goal:** fill in `app/_styles/{_variables,_mixins,_typography,_utils,globals}.scss` so component modules can reference them through `additionalData` auto-import.

**Files touched:**

- `app/_styles/_variables.scss` — all `:root` custom properties + matching SCSS variables/maps where math needed
- `app/_styles/_mixins.scss` — `container`, `fluid-type`, `section-y`, `reveal` keyframes, named animations (`rise`, `fade-in`, `nav-pulse`, `spin`, `marquee`, `scroll-bar`), reduced-motion guard mixin
- `app/_styles/_typography.scss` — `.mono`, `.mono-sm`, `.display` + sizes, `.outline`, `.lede`, paragraph rules
- `app/_styles/_utils.scss` — `.container`, `.container--narrow`, `.section`, `.section__head`, `.section__index`, `.section__title`, `.sr-only`, `.tick-rule`
- `app/_styles/globals.scss` — reset + body + selection + image/anchor/button defaults + page-intro block

**Verify:** dev server compiles; visit `/` and see body uses the new tokens (`bg-cream`, `Josefin Sans`, etc.) — the placeholder page should re-render with the new typography even though it's still text.

**Exit criteria:** every `:root` token from `shared.css` exists; every responsive token override is preserved; `npm run build` succeeds.

### Phase 3 — Layout shell (Nav, Footer, CustomCursor, Reveal)

**Goal:** site chrome is in place on every route. Routes still 404 or placeholder, but the nav, footer, cursor, reveal all work.

**Files touched:**

- `app/_components/Nav/Nav.tsx` + `_Nav.module.scss` — fixed top, mobile hamburger drawer, `usePathname()` active state, scrolled state effect
- `app/_components/Footer/Footer.tsx` + `_Footer.module.scss` — accepts `heading` + `metaLinks` props
- `app/_components/CustomCursor/CustomCursor.tsx` + `_CustomCursor.module.scss` — client, media-query-conditional
- `app/_components/Reveal/Reveal.tsx` — thin wrapper that adds `.reveal` + optional `data-delay`; mount-level IntersectionObserver in a separate `RevealRoot` client component in the root layout
- `app/_components/Arrow/Arrow.tsx` — reusable SVG with stroke/size props
- `app/_components/Container/Container.tsx`
- `app/_components/Section/Section.tsx`
- `app/_components/SectionHead/SectionHead.tsx`
- `app/_components/Button/Button.tsx` + `_Button.module.scss`
- `app/_components/TickRule/TickRule.tsx`
- `app/_components/PageIntro/PageIntro.tsx` + `_PageIntro.module.scss`
- `app/_components/MonoLabel/MonoLabel.tsx`
- `app/_components/Tag/Tag.tsx`
- `app/layout.tsx` — wire in `<RevealRoot>` + `<CustomCursor>` + `<Nav>` + `<Footer>` (with default props the home page can override)
- `app/_lib/site-config.ts` — single source for nav links, social links, owner name + email

**Verify:** dev `/` has the real nav and footer; tab order is correct; mobile drawer opens and traps focus.

**Exit criteria:** Nav + Footer pass keyboard + screen-reader; Lighthouse a11y on the still-empty home reads 95+.

### Phase 4 — Home page (`/`)

**Goal:** `/` renders the full landing page identical (to a careful eye) to `index.html`.

**Files touched:**

- `app/page.tsx` — server component that composes the home sections
- `app/_components/home/Hero/Hero.tsx` + `_Hero.module.scss` — variant toggle, badge, status, scroll cue
- `app/_components/home/Hero/HeroVariantA.tsx` (+ B) — sub-components for the two variants
- `app/_components/home/Marquee/Marquee.tsx` + `_Marquee.module.scss`
- `app/_components/home/Intro/Intro.tsx` + `_Intro.module.scss` — sticky label + body grid
- `app/_components/home/Stats/Stats.tsx` + `_Stats.module.scss` — count-up animation hook
- `app/_components/home/Services/Services.tsx` + `_Services.module.scss`
- `app/_components/home/SelectedWork/SelectedWork.tsx` + `_SelectedWork.module.scss`
- `app/_components/home/SelectedClients/SelectedClients.tsx` + `_SelectedClients.module.scss`
- `app/_components/home/Recognition/Recognition.tsx` + `_Recognition.module.scss`
- `app/_components/home/Experience/Experience.tsx` + `_Experience.module.scss`
- `app/_components/home/EndCTA/EndCTA.tsx` + `_EndCTA.module.scss`
- `app/_components/home/TweaksPanel/TweaksPanel.tsx` + `_TweaksPanel.module.scss` — client, lifts state to a `HomeContext`
- `app/_lib/home-content.ts` — single object with all home copy (stats numbers, service items, work items, client list, recognition items, xp items). Lets future copy changes happen in one file.
- `app/_types/home.ts` — types for the above
- `app/_types/work.ts` — `WorkProject` type used by SelectedWork
- `app/_types/experiment.ts` — `Experiment` type if we ever embed real test results (placeholder for now)

**Verify:** Hero variant toggle works; tweaks panel swatches change accent; localStorage round-trips; reveals fire as you scroll; marquee scrolls smoothly; stats count up; all hover states match (work-row title slides + accent sweep; service hover lightens bg; award seal rotates).

**Exit criteria:** Visual diff against `Mainul's Portfolio/index.html` is within rounding (no missing sections, no broken alignment). `prefers-reduced-motion` disables the marquee, count-up, spin, rise, and reveal transforms.

### Phase 5 — About + Contact

**Goal:** `/about` and `/contact` render with full content + functional form.

**Files touched (About):**

- `app/about/page.tsx`
- `app/about/_aboutPage.module.scss`
- `app/about/_components/AboutBio/AboutBio.tsx` + `_AboutBio.module.scss`
- `app/about/_components/AboutAvatar/AboutAvatar.tsx` + `_AboutAvatar.module.scss`
- `app/about/_components/AboutCard/AboutCard.tsx` + `_AboutCard.module.scss`
- `app/about/_components/Skills/Skills.tsx` + `_Skills.module.scss`
- `app/about/_components/Personal/Personal.tsx` + `_Personal.module.scss`
- `app/about/_components/ResumeCTA/ResumeCTA.tsx` + `_ResumeCTA.module.scss`
- `app/_lib/about-content.ts` — bio paragraphs, skills groups, personal copy
- `public/me.jpg` (or `.webp`) — self-hosted portrait
- Re-uses `<Experience>` from home

**Files touched (Contact):**

- `app/contact/page.tsx`
- `app/contact/_contactPage.module.scss`
- `app/contact/_components/ContactAside/ContactAside.tsx`
- `app/contact/_components/DirectLink/DirectLink.tsx`
- `app/contact/_components/ContactForm/ContactForm.tsx` + `_ContactForm.module.scss` — client, Zod-validated
- `app/contact/_components/TopicChips/TopicChips.tsx`
- `app/contact/_components/FAQ/FAQ.tsx` + `_FAQ.module.scss`
- `app/api/contact/route.ts` — POST handler, Zod validation, Resend send
- `app/_lib/contact-schema.ts` — Zod schema (`name`, `email`, `topic`, `message`); export `z.infer<typeof contactSchema>` type
- `app/_lib/email.ts` — thin Resend wrapper; reads `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` from env
- `app/_lib/faq-content.ts` — FAQ Q&A pairs
- `.env.local.example` — documents the env vars
- `app/_types/contact.ts` — form state, success/error variants

**Dependencies added (request approval before installing):**

- `zod` — runtime validation. **Yes** — CLAUDE.md line 79 mandates it for user input.
- `resend` — transactional email. **TBD** in phase plan. Alternative: keep static template's fake submit until phase 7. Recommended: yes, install in phase 5 so the contact path is functional from day 1.

**Verify:** form rejects empty submissions with field-specific accessible errors; success state animates in; FAQ accordions open/close with keyboard; resume CTA download works.

**Exit criteria:** Lighthouse a11y on both pages = 100. Form submits a real email to the configured address (test with a personal address first).

### Phase 6 — Work index (`/work`) + 3 case studies as MDX

**Goal:** `/work` lists all projects with filters; each `/work/[case]` renders from MDX.

**Files touched:**

- `app/work/page.tsx` + `_workPage.module.scss`
- `app/work/_components/Filters/Filters.tsx` + `_Filters.module.scss` — client, filter state, project count
- `app/work/_components/IndexRow/IndexRow.tsx` + `_IndexRow.module.scss`
- `app/_lib/work-projects.ts` — single array of all `WorkProject` entries (6 today). Source of truth — both `/work` and the home `<SelectedWork>` read from it (with home filtering to `featured: true`).
- `app/work/avsb/page.mdx` — full MDX content
- `app/work/kemon-doctor/page.mdx`
- `app/work/client/page.mdx`
- `app/work/_components/case/CaseHero.tsx` + `_CaseHero.module.scss`
- `app/work/_components/case/CaseMeta.tsx`
- `app/work/_components/case/CaseBlock.tsx` + `_CaseBlock.module.scss`
- `app/work/_components/case/CaseVisuals.tsx` + `_CaseVisuals.module.scss`
- `app/work/_components/case/CodeMock.tsx` + `_CodeMock.module.scss`
- `app/work/_components/case/NextCase.tsx` + `_NextCase.module.scss`
- `app/work/_components/case/Countries.tsx`
- `app/work/_components/case/CaseLayout.tsx` — wraps an MDX page with the breadcrumb context + next-case pager
- `mdx-components.tsx` — extend with case primitives in `useMDXComponents` so MDX can use them without imports

**MDX frontmatter convention:**

```yaml
---
slug: avsb
order: 1
title: AvsB
hero:
  display: ['AvsB.', 'Experiments,', 'in code.']
  classes: [null, 'outline', null]
  accent: 0 # the index of the line that wears the accent dot/period
summary: An in-house experimentation platform...
meta:
  role: Sole developer
  type: Own product
  year: 2025 – Present
  status: in-progress
nextCase: kemon-doctor
nextCaseLabel: Next case · 02
---
```

Each MDX body uses `<CaseBlock>` directly. The shared `CaseLayout` wraps the page based on frontmatter.

**Verify:** all 3 case studies render with correct hero treatments (accent dot on Variant 1, outlined middle line, accent line where present); next-case pager links correctly (1 → 2 → 3 → 1); breadcrumb back-link works.

**Exit criteria:** Lighthouse a11y = 100. MDX builds cleanly. Hot reload works while editing case content.

### Phase 7 — Polish & launch readiness

**Goal:** ship-quality. Everything the masterplan said was "deferred to phase 7" lands here.

**Files touched:**

- `app/layout.tsx` — full Metadata API: `metadataBase`, `openGraph`, `twitter`, `robots`, `icons`
- `app/sitemap.ts` — static sitemap covering all 6 routes
- `app/robots.ts` — allow-all (no staging gates)
- `app/opengraph-image.tsx` — generated OG image with display type + accent dot
- `app/icon.{tsx,png,svg,ico}` — favicon set
- `public/cv.pdf` — self-hosted resume (replaces Google Drive link)
- `public/me.{jpg,webp}` — confirm both sizes exist
- Replace every `<a href="https://drive.google.com/...">` with `/cv.pdf` (about + contact + footer × N + about-resume + work-footer)
- Replace `<img src="https://avatars.githubusercontent.com/...">` with `<Image src="/me.jpg" alt="Mainul Islam">`
- All raster images audited — use `next/image` with explicit width/height
- 404 page (`app/not-found.tsx`) styled to match the design language
- Run `npm audit` and resolve the 2 moderate vulnerabilities (futureWorks.md:24)
- Run a final Lighthouse pass on all 7 pages, fix anything below 95 on perf/a11y/best-practices/SEO
- Test on real mobile devices (or DevTools device toolbar): iPhone 12, Pixel 5, iPad Mini

**Exit criteria:** Vercel deploy preview passes; Lighthouse mobile ≥ 90 perf, ≥ 95 a11y, 100 best-practices, 100 SEO; custom domain (TBD) configured; OG card previews correctly when the URL is pasted into Slack/Twitter/iMessage.

### Phase 8 (optional) — Live experiment surface

**Goal:** _show, don't tell_ — make the portfolio its own A/B test demo. Two concrete ideas (pick one or skip both):

- **Hero variant analytics**: the existing A/B toggle is purely cosmetic. Instrument it with a privacy-friendly analytics endpoint (Plausible or a custom `/api/event/route.ts` that pings a Postgres counter) and show the running variant-A vs variant-B click-rate on the home page itself. Self-referential and on-brand.
- **End-to-end experiment using AvsB**: once AvsB is dog-foodable (it's "in progress" today), wire the portfolio to it. The hero badge, end CTA copy, and contact form heading all run through an AvsB-managed experiment. The case study then has real, live numbers.

Defer the decision to a phase-8 plan once AvsB is closer to ready. Probably not v1.

---

## 11. Dependency policy

Per `CLAUDE.md:79` — every new dependency runs `/audit-deps` first. The masterplan permits without further audit (still call `/audit-deps` for record, but don't expect to bounce):

- `zod` — Zod for input validation. Mandated.
- `resend` — transactional email. Mainstream, audited, small surface.
- `clsx` — class-name composition. Tiny, no transitive deps. Optional — only add if conditional className logic gets gnarly.

The masterplan **does not permit** without explicit re-approval in a phase plan:

- Any animation library (Framer Motion, GSAP, Lenis, motion-one). The static template uses 100 lines of vanilla JS — we can match it.
- Any UI kit (shadcn, Radix UI, Headless UI, Mantine). We're hand-rolling — that's the whole point.
- Any state management beyond React's built-ins (Zustand, Jotai, Redux). The Tweaks panel + variant state fits in one Context.
- Any CSS-in-JS library. SCSS modules only.
- Analytics SDKs (Plausible script, Google Analytics, Vercel Analytics). Even Vercel Analytics. See `CLAUDE.md:81`.

If a real need surfaces, write the proposal into the phase plan with the audit attached.

---

## 12. Environment variables

Captured here so the phase-5 contact spec doesn't need to re-discover them.

| Var                    | Where                | Value example             | Notes                                                                   |
| ---------------------- | -------------------- | ------------------------- | ----------------------------------------------------------------------- |
| `RESEND_API_KEY`       | `.env.local`, Vercel | `re_xxxxxxxxxx`           | Server-only, never exposed to client                                    |
| `CONTACT_FROM`         | `.env.local`, Vercel | `Portfolio <hello@…>`     | The "from" address Resend sends from (must be a verified Resend sender) |
| `CONTACT_TO`           | `.env.local`, Vercel | `m.main2402@gmail.com`    | Where contact-form messages land                                        |
| `NEXT_PUBLIC_SITE_URL` | `.env.local`, Vercel | `https://mainulislam.dev` | Used by `metadataBase`, sitemap, OG image                               |

A `.env.local.example` lands in the repo with the keys + descriptions (no real values).

---

## 13. Open questions to resolve before each phase

These don't block writing the masterplan but **will block** the phase plans they belong to. Resolve in the phase plan, then update this section.

| Question                                                                        | Belongs to phase | Default proposal                                                              |
| ------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------- |
| Should stub case pages exist for Flatwhite / Crypto Gods / Pascal?              | Phase 6          | No — anchor jumps into `/work/client` for now; promote if content arrives.    |
| Form backend: Resend? Formspree? Other?                                         | Phase 5          | Resend + custom route handler.                                                |
| Rate-limit the contact form?                                                    | Phase 5          | No for v1; revisit after a month if spam appears.                             |
| Self-host portrait or keep GitHub avatar hot-linked?                            | Phase 5/7        | Self-host (`public/me.jpg`).                                                  |
| Self-host CV or keep Google Drive link?                                         | Phase 7          | Self-host (`public/cv.pdf`).                                                  |
| OG image — generated dynamically with `app/opengraph-image.tsx`, or static PNG? | Phase 7          | Dynamic — let the accent colour be configurable later.                        |
| Custom domain?                                                                  | Phase 7          | `mainulislam.dev` (TBD — confirm registration).                               |
| 404 page design                                                                 | Phase 7          | Match `page-intro` treatment; "Couldn't find that. / **Try the work index.**" |
| Add stats count-up on /about (skill counts, country counts)?                    | Phase 5          | No — keep count-up exclusive to home for emphasis.                            |
| Sticky desktop nav, or fade in/out on scroll up/down?                           | Phase 3          | Sticky (matches template).                                                    |
| Reveal-on-scroll: per-component refs, or single mount-level observer?           | Phase 3          | Single mount-level observer (matches template; less ceremony).                |

---

## 14. Non-goals

To prevent scope creep, the following are **explicitly out** of v1:

- Dark mode
- i18n / multi-language (Bangla site for Kemon Doctor lives at its own URL — not here)
- A blog / writing section
- Newsletter signup
- Comments on case studies
- Live activity feed ("recently shipped tests")
- 3D / WebGL hero
- Animated SVG illustrations beyond the existing stroked text + dashed seal
- Loading screens / preloaders
- Page transition animations between routes (`view-transition` API is fine to explore as an enhancement later, but not for v1)
- Cookie banner (no tracking → no cookies → no banner needed)
- Search

---

## 15. Glossary

- **Variant A / Variant B** — two interchangeable hero headlines exposed via a toggle. The toggle is **part of the design**; it's not a real A/B test (yet — see Phase 8).
- **AvsB** — Mainul's own product, capital A capital B with no slash; the name is its identity.
- **CRO** — Conversion Rate Optimisation — the discipline AvsB and most of Mainul's client work sits in.
- **Optimizely / Kameleoon / Qubit** — enterprise experimentation platforms Mainul has built tests on for clients. Brand names, capitalised consistently.
- **Conversion.com** — the optimisation agency Mainul was on a long-running contract with from 2022 to 2026.
- **Tweaks panel** — the floating black pill in the bottom-right of the home page that lets a visitor change the accent colour and hero variant.
- **Reveal-on-scroll** — the staged fade-in-and-rise animation triggered by IntersectionObserver when an element enters the viewport.
- **Mono caption** — JetBrains Mono uppercase text used for labels, dates, indices. The visual rhythm-keeper of the design.
- **Stroked / outlined text** — `color: transparent; -webkit-text-stroke: 1.2px var(--fg)` — a recurring display treatment used in hero, case heroes, end CTA, and footer wordmark.

---

## 16. Living-document changelog

Append entries here when the masterplan is amended.

- **2026-05-21** — Initial draft. Captured from the static template at `Mainul's Portfolio/` and the scaffolded Next.js project state.
- **2026-05-23** — Phase 7 amendments: §3.1 — accent switcher dropped from scope (the Tweaks-panel accent control is no longer planned). §10 Phase 7 — CV self-hosted at `/Resume_Mainul.pdf` (not `/cv.pdf`); production domain `mainul.info`; per-case OG images added to scope.
