# Page transitions + entrance animations — plan

Bring every page up to the polish level of the homepage. Today only `/` has visible motion — the hero text staggers in, the marquee scrolls, stat counters animate. `/about`, `/contact`, `/work`, and the case-study pages just appear. There is also a wordmark splash on first load, but route changes after that only show a 1px hairline progress bar across the top — easy to miss. This plan addresses both.

---

## Why now

The homepage sets a clear motion language (staggered text reveal, calm easing, accent colour). Every other page lands silently, which makes them feel like a different site. The micro 1px route bar on navigation also under-sells the moment of transition — a portfolio benefits from a deliberate "the page is changing" beat. Both gaps are visible to anyone clicking around, and both are fixable without new dependencies (GSAP is already in the stack).

---

## What's changing

### 1. Sliding panel transition on every page navigation

A solid coloured panel sweeps across the screen on every route change. It covers the screen as the old page leaves, then sweeps off to reveal the new page underneath.

- Replaces the current thin 1px hairline route bar (which currently lives inside the `Loader` component and is easy to miss).
- Plays on navigation only — the first page load still uses the existing wordmark splash, unchanged.
- Total duration ~0.7s end-to-end. Calibrated to feel deliberate without making the site feel slow on repeat navigation.
- Respects `prefers-reduced-motion` — reduced-motion users get the new page instantly (no panel), same as the current splash already does.

### 2. Entrance animation for every page intro

When a page lands (whether from first load or after a navigation transition), the `PageIntro` block animates in:

- Title lines stagger up from below (same yPercent reveal language the homepage hero already uses).
- Label and sub fade in shortly after.
- The whole page wrapper gets a subtle fade-up underneath that, so sections below the fold feel anchored to the entrance rather than just popping in.

Used by `/about`, `/contact`, `/work`, the 404, and the case-study detail pages (via `CaseHero`).

### 3. /cv stays static

The CV route is built for print and PDF export. Both the sliding panel and the entrance animation are skipped on `/cv` so the print preview, the on-screen print button, and "save as PDF" flow stay clean. Navigating _to_ and _from_ /cv is also static — clicking the CV link in the nav just lands on the page without the panel sweep, since a print-style document arriving via a stage curtain would be jarring.

### 4. Homepage hero — unchanged

The existing `Hero` text-reveal stays exactly as it is. The new page-intro entrance runs on the _non-home_ pages (which currently have zero entrance motion). Home keeps its bespoke hero so there's no duplicated animation playing on top of itself.

---

## What this is not

- **Not a new motion library.** No framer-motion, no motion.dev. GSAP is already wired up and handles all of this.
- **Not View Transitions API.** Browser support is good but uneven, and the experimental Next.js flag is still experimental. GSAP gives us a deterministic, designable transition.
- **Not a redesign.** Colours, type, spacing all stay. Only the _entrance_ is new.
- **Not a per-section animation pass.** The existing `Reveal` component already handles scroll-triggered reveals for content below the fold on every page — no change there.
- **Not a route-loading indicator.** This is a deliberate transition, not a "your network is slow, please wait" spinner. Pages are statically generated; load is essentially instant.

---

## Risk callouts

- **Print on /cv.** Already addressed by skipping /cv entirely, plus a `@media print` guard on the panel as a belt-and-braces safety net.
- **Scroll position.** When a route changes, Next.js scrolls to top. The panel needs to cover the screen before the scroll jump, otherwise users see the old page flash to the top first. The transition timing accounts for this.
- **Repeat navigation feeling slow.** 0.7s on every nav can wear out its welcome. If it does, dropping to ~0.5s is a one-number change post-launch.
- **Reduced-motion users.** They get instant page swaps with no panel, no fade, no stagger. Verified against the existing `prefers-reduced-motion` patterns already used in `Loader` and `Reveal`.

---

## Branches and process

- Branch: `feature/page-transitions`.
- Plan + spec each get their own commits, pushed before implementation starts.
- Implementation commits split per logical unit (panel component, page-intro animation, layout wiring, loader cleanup, /cv guard).
- `/ship` (typecheck + lint + build) before the PR. Manual visual check of every route in `npm run dev`: home (verify hero still works), /about, /contact, /work, /work/avsb (case study), /cv (verify static), /404.
- Single PR back to `main` at the end.
