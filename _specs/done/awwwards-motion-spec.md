# Awwwards-level motion & visuals — technical spec

**Plan:** `_plans/awwwards-motion-plan.md`
**Branch:** `feature/awwwards-motion`
**Date:** 2026-06-11

## Confirmed constraints

- gsap@3.15.0 ships ScrollSmoother + SplitText in the public npm package (free since 3.13). **No new dependencies.**
- All motion gated behind `prefers-reduced-motion: no-preference` via `gsap.matchMedia()` / the `reduced-motion-safe` mixin, matching existing patterns.
- SCSS modules only, camelCase classes, no manual `@use` of variables in component modules.
- Server components by default; `'use client'` only where hooks/GSAP are needed. Client components stay leaf-shaped.

## Shared infrastructure

### `app/_lib/motion.ts` (edit)

Register and re-export `ScrollSmoother` and `SplitText` alongside the existing `gsap` + `ScrollTrigger`.

### `app/_lib/loader-signal.ts` (new)

Tiny pub/sub so the hero can wait for the loader. `signalLoaderDone()` (called by Loader, idempotent), `onLoaderDone(cb)` — fires immediately if already done (covers late mounts and client navigations). No DOM events; module state survives because Loader and Hero live in the same bundle.

## Layer 0 — visual content

### Work cover images

- `app/_types/work.ts`: add `cover: string` (path under `/work/<slug>/`) and `coverAlt: string` to `WorkProject`.
- `app/_lib/work-projects.ts`: pick a hero-quality capture per project:
  avsb → `/work/avsb/results-page.png`, kemon-doctor → `/work/kemon-doctor/kemondoctor-01.png`, radius → `/work/radius/01-hero.png`, cursimax → `/work/cursimax/home.png`, flatwhite → `/work/flatwhite/home.png`.
- **Home `WorkRow`** (edit + `_SelectedWork.module.scss`): add a cover thumbnail (`next/image`, `fill` inside an aspect-ratio box) as a new column. Visible at all viewports — this is the direct answer to "no visuals". Desktop hover additionally gets the Layer-3 floating preview.
- **`/work` `IndexRow`** (edit + `_IndexRow.module.scss`): same treatment, smaller thumb.
- Images get `sizes` hints; thumbnails are not LCP so no `priority`.

### `BrowserFrame` (new, server) — `app/_components/BrowserFrame/`

Minimal browser chrome (three dots + hairline) wrapping any `next/image`. Used by `CaseImage` so case screenshots read as composed shots. Dots/bar are decorative (`aria-hidden`).

### `GrainOverlay` (new, server) — `app/_components/GrainOverlay/`

Fixed full-viewport div, `pointer-events: none`, `z-index` above content below cursor, SVG `feTurbulence` data-URI at ~4–5% opacity. Static (not animated) so it needs no reduced-motion gate. Mounted once in `layout.tsx`.

## Layer 1 — foundation

### `SmoothScroll` (new, client) — `app/_components/SmoothScroll/`

- Renders `#smooth-wrapper > #smooth-content` around `children`; created in `layout.tsx` wrapping `<main>` only. Nav, Loader, CustomCursor, PageCurtain, skip-link stay outside (they're fixed).
- `ScrollSmoother.create({ smooth: 1, effects: true, smoothTouch: false })` inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` and only for `(hover: hover) and (pointer: fine)` — touch devices keep native scroll.
- Kill + recreate is unnecessary across routes (layout persists); but call `ScrollSmoother.refresh()` on `pathname` change so new page heights register, and scroll to top on navigation (PageCurtain already handles the visual).
- **Edge cases:** Loader and Nav drawer currently lock `body.overflow` — additionally `ScrollSmoother.get()?.paused(true/false)` in both. Skip-link anchor: verify focus jump still scrolls (ScrollSmoother handles `scrollTop` proxying; manual test).

### `SplitReveal` (new, client) — `app/_components/SplitReveal/`

- Props: `as` ('h1'|'h2'|'h3'|'p'|'span'|'div'), `type` ('lines'|'words'|'chars'), `mode` ('scroll'|'mount'|'loader'), `delay?`, `className?`, `children`.
- `SplitText.create(el, { type, mask: 'lines', autoSplit: true, onSplit })` after `document.fonts.ready`; animates pieces `yPercent: 110 → 0`, `expo.out`, stagger by type (lines 0.09, words 0.05, chars 0.018). `mode: 'scroll'` uses ScrollTrigger `top 85%`, once. `mode: 'loader'` waits on `onLoaderDone`.
- SplitText's `aria: true` default keeps the text readable to screen readers (label on parent, pieces hidden).
- Reduced motion: no split, element renders as-is.
- Applied to: `SectionHead` title, `PageIntro` title (mode scroll/mount), `EndCTA` heading (lines), `CaseHero` title if trivial to slot, hero variants stay on their existing word-mask timeline (retimed in Layer 4).
- `SectionHead`/`PageIntro`/`EndCTA` drop the whole-block fade for their titles (title = SplitReveal; surrounding meta keeps `Reveal`). Avoid double-animation: title is no longer inside a `Reveal`.

## Layer 2 — scroll choreography

### Parallax via smoother effects

`data-speed` attributes (e.g. `0.92`–`1.06`) on case images and cover thumbs — ScrollSmoother's `effects: true` picks them up; zero JS per image. Inert when smoother is off (touch/reduced-motion) — graceful.

### `ImageReveal` (new, client) — `app/_components/ImageReveal/`

Wrapper: `clip-path: inset(0 0 100% 0)` → `inset(0)` plus inner scale `1.18 → 1`, ScrollTrigger once at `top 85%`, 1.1s `expo.out`. Used by `CaseImage` (inside `BrowserFrame`) and the index/home cover thumbs. Reduced motion: visible immediately (`gsap.set` final).

### Velocity-reactive marquee (edit `Marquee.tsx`)

ScrollTrigger on the marquee with `onUpdate`: map `getVelocity()` to `timeScale` (1 → ~3.5, signed) and `skewX` (clamp ±6deg), tween back to neutral with `power3.out`. Existing infinite tween stays the base.

### Footer/EndCTA uncover + scrub drift

`Parallax` (new, client, generic): props `from`/`to` (yPercent or xPercent), scrub wrapper around children. Used for: footer giant wordmark (`yPercent 40 → 0` as footer enters), EndCTA outline line (`xPercent ±4` drift). Reduced motion: static.

## Layer 3 — hover & cursor

### `WorkPreview` (new, client) — `app/_components/home/SelectedWork/`

- `SelectedWork` renders rows + `WorkPreview` (client leaf). Rows get `onMouseEnter`/`onMouseLeave` via a thin client wrapper or `data-preview-index` + event delegation in `WorkPreview` (preferred — rows stay server).
- Fixed-position stack of the featured covers (`next/image`, preloaded small sizes), `quickTo` x/y follow with slight lag, rotation from x-velocity (clamp ±8deg), crossfade/`yPercent` flip on row change, hidden when not over the list.
- Desktop fine-pointer + no-reduced-motion only. `aria-hidden`, `pointer-events: none`.

### Cursor labels (edit `CustomCursor`)

On `mouseover`, read `closest('[data-cursor-label]')`; if present, set label text into a `<span>` inside the cursor, add `isLabel` class (cursor grows to ~64px pill, label in mono caps). Markup already carries `data-cursor-label` in WorkRow/IndexRow/Nav. Label is `aria-hidden` (cursor div already is).

### `RollingText` (new, server) — `app/_components/RollingText/`

Two stacked spans in an overflow-hidden box; parent `:hover`/`:focus-visible` translates the stack -100% (`--ease-out`, 0.4s), gated by `reduced-motion-safe`. Duplicate is `aria-hidden`. Applied to Nav links and Footer meta links (triggered by parent class, e.g. `.link:hover .roll`).

## Layer 4 — signature moments

- **Loader handoff:** Loader calls `signalLoaderDone()` as the panel starts lifting (and immediately in the reduced-motion branch). Hero/PageIntro `mode: 'loader'` timelines start from the signal instead of a hardcoded 0.15s — on first load the headline rises while the loader panel is still clearing (overlap ~0.2s = the "one continuous move" feel). Module flag in loader-signal means client navigations start instantly.
- **Hero scroll-out:** ScrollTrigger scrub on hero inner: `scale → 0.96`, `opacity → 0.35`, `y → 60` over the hero's exit. Reduced-motion gated.
- **Nav drawer cascade:** SCSS-only — in the open state, links get incremental `transition-delay` via `nth-child` (60ms steps) on their existing opacity/translate transitions. No new JS.

## Accessibility checklist for this feature

- Every effect inert under `prefers-reduced-motion: reduce` (matchMedia or mixin); smooth scroll falls back to native.
- SplitText `aria: true`; all decorative layers (grain, preview, cursor, frames' chrome, ghost marks) `aria-hidden` + `pointer-events: none` where applicable.
- New thumbs: meaningful `coverAlt` text ("AvsB experiment results dashboard" etc.).
- Keyboard: RollingText triggers on `:focus-visible` too; no interaction is hover-only in function (previews/cursor are pure decoration).
- Tab-through pass + Lighthouse a11y before ship.

## Commit sequence

1. `feat: motion infra — smoother, splittext, loader signal` (motion.ts, SmoothScroll, layout, loader-signal)
2. `feat: layer 0 — work covers, browser frames, grain` (types, data, WorkRow, IndexRow, CaseImage, BrowserFrame, GrainOverlay)
3. `feat: layer 1 — splittext reveals` (SplitReveal, SectionHead, PageIntro, EndCTA)
4. `feat: layer 2 — parallax, unveils, velocity marquee, footer uncover` (ImageReveal, Parallax, Marquee, Footer)
5. `feat: layer 3 — work preview follower, cursor labels, rolling links` (WorkPreview, CustomCursor, RollingText, Nav, Footer)
6. `feat: layer 4 — loader handoff, hero scroll-out, drawer cascade` (Loader, Hero, Nav scss)

Each commit pushed; `/ship` gauntlet after 6; code-reviewer before final push.

## Retrospective

- **The "auto-imported mixins" assumption was wrong.** The spec (and CLAUDE.md rule 6) says component modules must not `@use 'mixins'` because `additionalData` injects them — but Turbopack ignores the function-form `additionalData`, so `_RollingText.module.scss` broke the build until an explicit `@use` was added. futureWorks already tracked this (`[build]`, 2026-05-22); the rules docs still need updating.
- **PageIntro already had a masked title rise** — the spec said "apply SplitReveal" but it was really a replacement; `_PageIntro.module.scss` was deleted, not extended.
- **StickyPin needed a multi-frame retry**, not the single rAF the spec assumed, to wait for ScrollSmoother creation reliably.
- **EndCTA scrub drift was dropped** during implementation for visual restraint (logged in futureWorks).
- Code review added: cleanup hardening in SplitReveal's font-ready path and a null-guard on cursor labels.

## Known risks

- ScrollSmoother × Next App Router: layout persists so the instance survives navigation, but `refresh()` on pathname change is required or ScrollTriggers measure stale heights.
- ScrollSmoother breaks `position: sticky` inside the smoothed content — grep for `sticky` before enabling and adapt anything found.
- The whole layer-1 item is reversible by deleting `SmoothScroll` from layout if real-device feel is bad.
