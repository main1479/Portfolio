# Plan — Home page (Phase 4)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch (when created):** `feature/home-page`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 4 (lines 700–726), §5.2 (home composition), §7 (interactions), §11 (≤320px guardrail)

---

## What

Port the legacy `Mainul's Portfolio/index.html` (1,410 lines, one static file) into the live Next.js app, so `/` renders the full landing page — Hero with the A/B variant toggle, the marquee, intro, stats, services, selected work, selected clients, recognition, experience, end-CTA, and the floating tweaks panel — composed inside the Phase 3 chrome.

The twelve components that land in this phase, all under a new `app/_components/home/` namespace:

| #   | Component         | Type   | Notes                                                                                                        |
| --- | ----------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| 1   | `Hero`            | Client | Topbar (name + tick-rule + meta), three-line display headline, badge, variant toggle, sub + status           |
| 2   | `HeroVariantA`    | Server | "Frontend / Developer [A/B Testing] / & Experiments" — the default                                           |
| 3   | `HeroVariantB`    | Server | "Turning / Traffic into / Revenue."                                                                          |
| 4   | `HeroBadge`       | Client | The rotated `[A/B] Testing` chip; click cycles variant                                                       |
| 5   | `Marquee`         | Client | Two duplicated tracks under the hero, infinite-loop translate animation                                      |
| 6   | `Intro`           | Server | Sticky mono label + body grid (three-paragraph blurb)                                                        |
| 7   | `Stats`           | Client | Three counters with count-up-on-reveal hook (500+, 7, 6)                                                     |
| 8   | `Services`        | Server | Three-column grid: A/B Testing, Frontend Development, Product Building                                       |
| 9   | `SelectedWork`    | Server | Three `work-row` links → `/work/avsb`, `/work/kemon-doctor`, `/work/client`                                  |
| 10  | `SelectedClients` | Server | 4×2 grid of brand cards (The Times, G-Star RAW, Motorway, Unity, IronmongeryDirect, WaterAid, AdBlock, Deel) |
| 11  | `Recognition`     | Server | Two SOTD award cards with rotating dashed seal (BestCSS.in Dec 2021, Design Nominees Nov 2021)               |
| 12  | `Experience`      | Server | Two `xp-row`s: Conversion.com (2022–2026), Freelance (2019–Present)                                          |
| 13  | `EndCTA`          | Server | Giant stroked-outline heading + sub-copy + accent button to `/contact`                                       |
| 14  | `TweaksPanel`     | Client | Floating bottom-right pill: 5 accent swatches (persisted to `localStorage`) + A/B toggle                     |

(That's fourteen, not twelve — `HeroVariantA`, `HeroVariantB`, and `HeroBadge` are sub-components of `Hero`; I'm counting them separately because they each live in their own file. They all belong to this phase.)

Plus the supporting non-component files:

- **`app/page.tsx`** — server component that composes the home sections in order. Replaces the Phase 3 placeholder.
- **`app/_components/home/_homePage.module.scss`** — page-level layout (hero `min-height`, marquee bleed, section spacing tweaks specific to the home page).
- **`app/_lib/home-content.ts`** — single object with all home copy: stats numbers, service items, work items (the three featured), client list, recognition items, xp items. Future copy changes happen in one file.
- **`app/_types/home.ts`** — types for the content above.
- **`app/_types/work.ts`** — `WorkProject` type used by `SelectedWork`. Created here even though `/work` doesn't land until Phase 6; `SelectedWork` needs it now, Phase 6 will reuse it.
- **`app/_lib/home-state.ts`** (or inline in `app/page.tsx`) — small client context that lets `Hero`, `HeroBadge`, and `TweaksPanel` share the variant + accent state. The legacy file did this with global DOM queries; we'll do it with React state lifted to a `'use client'` shell wrapping the home sections.

## Why

Phases 1–3 stood up the project, the tokens, and the chrome. None of that is visible work until something lives inside it. Phase 4 turns the site from "Next.js scaffold with a navbar" into "Mainul's portfolio" — the hero, the marquee, the stats, the selected work, the floating tweaks panel — the parts a visitor or recruiter would actually evaluate.

A second motivation: the home page is the only page in this project where the A/B-testing identity gets demonstrated rather than described. The variant toggle, the SelectedWork hover sweep, the tweaks panel — they're the signature moments the portfolio is selling. Until they exist on a real route, the rest of the site is words about a developer who builds experiments; with them, it _is_ an experiment-shaped thing.

A third: Phase 3 deliberately left `app/page.tsx` as a placeholder so Phase 4 could be pure composition. Almost no new global CSS gets written in this phase — the primitives from Phase 3 (`Container`, `Section`, `SectionHead`, `Button`, `TextLink`, `Arrow`, `Reveal`, `Tag`, `TickRule`) plus the tokens from Phase 2 carry most of the styling. The home-page CSS modules are just the section-specific layout and a few hero-only effects.

## Why now (not later)

- **It's the next phase on the masterplan and the most visible.** Phase 5 (About + Contact) and Phase 6 (Work + cases) both feel less urgent than the home page — a portfolio without a populated `/` is unshippable, but a portfolio with a populated `/` and placeholder sub-pages is at least demoable.
- **Validates the Phase 3 primitives in anger.** This phase composes every primitive Phase 3 built (Nav active link, Reveal stagger, TickRule, SectionHead, Container, Section, Button variants, TextLink, Tag, Arrow). Any rough edge in those primitives will show up here, where we can fix it before About/Contact/Work compound the problem.
- **`SelectedWork` shape feeds `/work`.** Phase 6's `/work` index reads from the same data shape `SelectedWork` does. Settling the `WorkProject` type and the `work-projects` data layout here means Phase 6 doesn't have to re-litigate it.
- **Hero variant + tweaks panel is the only interactive state on the home page.** Better to figure out the context/lifted-state pattern once, here, than to defer it to a vague "later."

## Scope guard — what does and doesn't ship

**Ships:**

- The fourteen components above, each in its own folder under `app/_components/home/` (sub-components live in their parent's folder).
- `app/page.tsx` fully composed.
- `app/_lib/home-content.ts` as the content source.
- `app/_types/home.ts` and `app/_types/work.ts`.
- Page-level SCSS module `_homePage.module.scss`.
- `prefers-reduced-motion` handling for the marquee, hero rise-in, stats count-up, badge fade-in, and award seal spin — non-essential motion is gated.
- `localStorage` accent persistence (key `mn-accent-v2`) wired through the tweaks panel.

**Does NOT ship:**

- `/work`, `/about`, `/contact` page content (Phase 5 + Phase 6). They stay as the Phase 3 placeholders. Nav links to them still work.
- Any new MDX wiring or case-page primitives (Phase 6).
- Contact form, Resend integration, FAQ (Phase 5).
- Resume CTA, About bio, skills grid (Phase 5).
- A real favicon (already tracked in `futureWorks.md`).
- Real OG image, sitemap, robots, full Metadata API (Phase 7).
- Self-hosted portrait or self-hosted CV (Phase 5 / Phase 7).
- Any new npm dependency.
- Any analytics, tracking, or third-party widget.
- Dark mode.
- Hero variant analytics (the masterplan future-works idea on line 849 — not now).

## Decisions I'm making (call them out below if you'd change any)

| Decision                                                                                  | Default                                                                                                                                                                                                                                                                           | Why                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How does the tweaks panel share state with the hero?                                      | A small React context (`HomeStateContext`) created inside a top-level `'use client'` shell that wraps the home sections in `app/page.tsx`. `Hero`, `HeroBadge`, and `TweaksPanel` consume it; everything else stays a server component.                                           | The masterplan suggests this exact approach (line 606). It keeps server-rendered sections server-rendered, and limits the client bundle to the three components that genuinely need it. No prop-drilling, no global store. |
| How is accent colour applied?                                                             | TweaksPanel sets `--accent` on `document.documentElement` (matches legacy behaviour exactly). Persisted to `localStorage` under `mn-accent-v2`. On mount, a small client effect reads the saved value and applies it.                                                             | Token system already exposes `--accent` as a CSS custom property — this is the minimal-surface-area way to swap it. Identical to legacy file lines 1389–1407.                                                              |
| How is the stats count-up implemented?                                                    | A single `useCountUp` hook in `app/_lib/use-count-up.ts`. Triggered by the existing `Reveal` IntersectionObserver. `prefers-reduced-motion: reduce` skips the animation and shows the final number immediately.                                                                   | The legacy file animates with vanilla JS — we'll port the same logic to a hook. Reusing the Phase 3 IO instead of mounting a second one.                                                                                   |
| Does the marquee use CSS animation or JS?                                                 | Pure CSS `@keyframes` (matches legacy). Gated by `@media (prefers-reduced-motion: no-preference)`.                                                                                                                                                                                | Cheapest, smoothest, and `prefers-reduced-motion` handling is one media query.                                                                                                                                             |
| Where do home content strings live?                                                       | One file: `app/_lib/home-content.ts`, exporting a strongly typed `homeContent` object. Component files import from it.                                                                                                                                                            | Content edits shouldn't require touching JSX. The masterplan calls this out explicitly (line 719). Will be referenced by Phase 5 (re-uses `Experience`) so it pays off twice.                                              |
| `SelectedWork` items — duplicate the array or share with the future `/work` index?        | Create `app/_lib/work-projects.ts` now, with all six projects from the masterplan. Home filters to `featured: true` (the three case studies). Phase 6 reuses the same file unchanged.                                                                                             | Avoids the future merge cost. The data is small and stable; the type is the same shape; no reason to duplicate. Costs one extra file in Phase 4, saves a refactor in Phase 6.                                              |
| Hero — one component or four files (`Hero`, `HeroVariantA`, `HeroVariantB`, `HeroBadge`)? | Four files in `Hero/`. `Hero.tsx` (client, owns the variant state + renders the topbar + variant toggle + bottom strip), `HeroVariantA.tsx` + `HeroVariantB.tsx` (server, just the headline lines), `HeroBadge.tsx` (client, the rotated chip).                                   | `Hero.tsx` is around 200 lines if everything lives in one file — exactly the boundary where CLAUDE.md says to split. Splitting also lets the two variants stay server-rendered, since they're just markup.                 |
| `TweaksPanel` — desktop-only or mobile too?                                               | Mobile too. Legacy collapses to a chip below 640px; we'll match.                                                                                                                                                                                                                  | The whole point of the panel is to telegraph "this site IS a product about experimentation." Hiding it on mobile defeats that signal.                                                                                      |
| Reduced-motion strategy                                                                   | Honour `prefers-reduced-motion: reduce` everywhere there's non-essential motion: hero rise-in, badge fade, marquee, count-up, award-seal spin, work-row hover transform/sweep, service hover bg, reveal transforms. Hover transitions on links/buttons stay (they're functional). | Accessibility rule in `.claude/rules/accessibility.md` is non-negotiable. Honouring it for the home page sets the pattern for the whole site.                                                                              |
| Are the SOTD links external? Do we preserve them?                                         | Yes — both award cards link out to `bestcss.in` and `designnominees.com` with `target="_blank" rel="noopener noreferrer"`. Same as legacy.                                                                                                                                        | Real recognition links, even if dated, beat dead seals. They came up in the masterplan recognition copy.                                                                                                                   |

## Risk

- **`Hero` is the most visually complex component on the whole site.** Three lines of `display-xl`, an inline `--shift` row with the badge, a variant toggle, a topbar with the tick-rule, and a bottom strip with sub-copy + status pulse + button. Highest single-component risk on the site. Mitigation: build the static markup against `index.html` line-by-line before adding the variant state.
- **The variant toggle restarts the rise-in animation when you switch variants** (legacy line 1356–1361 forces a reflow). React's declarative model doesn't love forced reflows. Mitigation: replace the reflow trick with a `key` prop on the variant container so React remounts on switch — same observable behaviour, idiomatic React.
- **The stats count-up could double-fire** if the section scrolls in and out of view repeatedly. Mitigation: the hook should latch — once it has counted up, it doesn't run again.
- **`mn-accent-v2` localStorage value could persist a colour that the new token system doesn't render well.** Mitigation: the swatch list is hard-coded to five values; we validate the saved value is one of them before applying, otherwise fall back to the default token.
- **Lighthouse a11y regression risk** is real for this phase — the home page is dense, with multiple interactive elements (variant buttons, tweaks panel, work-row links, badge button, contact CTAs). Mitigation: run Lighthouse against `/` at the end and chase any regression from the Phase 3 baseline before merging.
- **Bundle size.** This phase introduces the first significant client component (`Hero` + `TweaksPanel` + count-up hook). Mitigation: keep the home-state context tiny, keep variant sub-components as server components, don't pull in any third-party animation library. The variant rise-in + badge fade + marquee + spin all stay CSS.

## What ships when this phase is done

- Visit `/` in `npm run dev` → the full landing page renders, visually within rounding of `index.html`.
- Click variant toggle buttons or click the hero badge → headline lines swap; rise-in animation re-fires.
- Open the tweaks panel (bottom-right) → swatches change `--accent` site-wide; choice persists across refresh; variant toggle is mirrored.
- Scroll through the page → reveals stagger in, marquee scrolls, stats count up once, work-rows hover with title-slide + accent sweep, award seals spin.
- `npm run build && npm run lint && npx tsc --noEmit` all clean.
- Lighthouse a11y on `/` = 100 (or matches the Phase 3 baseline — investigate if lower).
- Nav `01 / Index` link is the active state.
- `/work`, `/about`, `/contact` remain as Phase 3 placeholders (sub-pages are subsequent phases).

## What does NOT ship when this phase is done

- The placeholder `/work`, `/about`, `/contact` pages (Phase 5–6).
- Case studies (Phase 6).
- Contact form (Phase 5).
- About bio + skills (Phase 5).
- Real favicon, OG image, sitemap, robots (Phase 7 + `futureWorks.md`).
- Self-hosted portrait (Phase 5).
- Self-hosted CV PDF (Phase 7).

## What I think you might want to push back on

- **Whether `work-projects.ts` should land in Phase 4 or Phase 6.** Putting it here means the file gets created two phases before the page that owns it. The trade-off is real but I think the cost-of-rework dominates.
- **Whether `HomeStateContext` is overkill.** An alternative is to lift the state into `app/page.tsx` and prop-drill into `Hero` and `TweaksPanel`. They're not deeply nested. Context is cleaner; prop-drilling is one less file. Yelling distance either way.
- **Whether the legacy `mn-accent-v2` key should be honoured for visitors who'd saved a colour against the static site.** I default to "yes, same key" because (a) it's harmless, (b) the swatch list is the same, (c) it preserves the one bit of user state the static site ever had. But if you'd rather start fresh, easy bump to `mn-accent-v3`.

## Out of scope (later phases or `futureWorks.md`)

- About page content (Phase 5).
- Contact page + form (Phase 5).
- `/work` index + case studies (Phase 6).
- Hero variant analytics endpoint (masterplan future ideas §849).
- Tokens-overflow on first-gen iPhone SE — already tracked in `futureWorks.md` and verified when the hero is in place.
- Sass `additionalData` build issue — already tracked in `futureWorks.md`.
