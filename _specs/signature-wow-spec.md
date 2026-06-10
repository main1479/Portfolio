# Signature wow pass — technical spec

**Plan:** `_plans/signature-wow-plan.md`
**Branch:** `feature/awwwards-motion` (continues PR #25)
**Date:** 2026-06-11

## Confirmed constraints

- `gsap@3.15` ships `ScrambleTextPlugin.js` (free since 3.13) — verified in node_modules. **No new dependencies.** WebGL is hand-rolled (raw WebGL1, no three.js/ogl).
- `Magnetic` already wraps every `Button`; `Stat` already counts up on scroll. Those plan items are already shipped — the micro-feel layer reduces to scramble effects.
- Only 3 projects are `featured` (avsb, kemon-doctor, radius) → home gallery = 3 project panels + 1 "all work" end panel.
- All motion gated by `prefers-reduced-motion` (gsap.matchMedia / `reduced-motion-safe`); component SCSS modules need explicit `@use 'mixins' as *;` (Turbopack additionalData gap).

## A. Loader assignment ceremony

### `app/_lib/experiment.ts` (new)

`assignVariant(): Variant` — reads `sessionStorage['mi-hero-variant']`; if absent, `Math.random() < 0.5 ? 'A' : 'B'`, persists, returns. try/catch → `'A'` (private-mode safe). Session (not local) storage on purpose: a returning visit can land in the other bucket — that's the bit.

### `app/_lib/motion.ts` (edit)

Register + export `ScrambleTextPlugin`.

### `Loader.tsx` + `_Loader.module.scss` (edit)

New elements (all inside the existing `aria-hidden` aside):

- `.counter` — large mono percentage, bottom-right.
- `.status` — small mono line above the progress track, scrambles through: `calibrating interface` → `bucketing visitor` → `variant {A|B} — locked`.
- `.stamp` — mono caps `EXP-001 · YOU'RE IN VARIANT {A|B}`, revealed at ~60%.

Timeline (no-preference branch): proxy `{v: 0}` → 100 over ~1.4s (`power2.inOut`), `onUpdate` writes `counter.textContent`; progress fill scaleX follows the same proxy; status line scrambleText swaps at 0 / 0.5 / 1.0s (`chars: 'upperAndLowerCase'`-style mono set); stamp scrambles in at ~0.85s; then the existing fade + lift (with `signalLoaderDone` onStart) appended. Reduced-motion branch unchanged (instant, signal immediately). Variant string comes from `assignVariant()` read in a `useEffect` + state (sessionStorage is client-only).

### `HomeShell.tsx` (edit)

`useEffect(() => setVariant(assignVariant()), [])`. SSR/hydration renders 'A'; the effect flips before the loader lifts on first load, and behind the page curtain on client navs (single-frame flip, not visible). Manual toggle afterwards still works — the toggle is the "switch buckets" control.

## B. Horizontal work gallery (home)

### `app/_components/home/WorkGallery/WorkGallery.tsx` + `_WorkGallery.module.scss` (new, client)

Markup: `<section>` → `.viewport` (100vh, pinned) → `.track` (flex row) → 3 `.panel` links (giant ghost index numeral, cover image ~55vw in a parallax clip, display-font title, metaShort, tags, arrow) + `.endPanel` (count + "All work" CTA → `/work`). Below the track inside the viewport: `.progress` — mono `01 / 04` counter + hairline bar.

Activation — CSS and JS share the exact same condition `(min-width: 901px) and (prefers-reduced-motion: no-preference) and (pointer: fine)`:

- CSS: under the media query, track is horizontal (panels ~70vw) and viewport is 100vh flex-centered. Default (mobile / touch / reduced motion): panels stack vertically as full-width cards; progress readout hidden; no pin.
- JS (gsap.matchMedia, same string): `gsap.to(track, { x: () => -(track.scrollWidth - viewport.clientWidth), ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + (track.scrollWidth - viewport.clientWidth), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } })`. Works inside ScrollSmoother (pinType handled by GSAP).
- Per-panel cover parallax via `containerAnimation`: each `.panelImg` `xPercent: -8 → 8`, trigger panel, `start 'left right', end 'right left'`, scrub.
- Progress: `onUpdate` → index = `Math.round(progress * (panels - 1)) + 1`, written as `0n / 04`; bar `scaleX: progress` via quickSetter.

Keyboard: panels are real links in DOM order. On `focusin` of a panel (when the pin is active), jump scroll to `st.start + progressForPanel * (st.end - st.start)` via `ScrollSmoother.get()?.scrollTo(y, false) ?? window.scrollTo(0, y)` so the focused panel is on screen. Focus order matches visual (left-to-right) order.

### `app/page.tsx` (edit)

Selected Work section restructured: `SectionHead` stays inside `Container`; `<WorkGallery projects={featuredWorkProjects} />` renders full-bleed below it; the foot `TextLink` to /work is removed (the end panel replaces it).

### Deletions

`app/_components/home/SelectedWork/` (SelectedWork, WorkRow, WorkPreview, both SCSS modules) is deleted — superseded by WorkGallery on home and the rebuilt WorkPreview on /work.

## C. WebGL distortion preview (/work index)

### `app/_lib/preview-gl.ts` (new)

Plain class, no React: `createPreviewGL(canvas, urls) → PreviewGL | null` (null when `getContext('webgl')` fails — caller falls back). API: `setActive(index)` (tweens an internal mix 0→1 between current/next textures — driven by gsap on a numeric property), `setVelocity(vx, vy)` (smoothed into uniforms), `start()/stop()` (rAF loop only while visible), `resize(w, h)`, `destroy()` (lose context, cancel rAF, free textures).

Shader (WebGL1, single quad):

- vertex: pass-through uv.
- fragment: cover-fit uv for each texture's aspect; ripple `uv += sin(uv.yx * 9.0 + uTime * 2.0) * uStrength` where `uStrength` tracks velocity magnitude (clamped); RGB split sampling offset along the velocity vector; transition `mix(texA, texB, smoothstep)` warped by a cheap procedural noise so the swap reads as a melt, not a crossfade.
- Textures lazy-loaded (`Image` + `texImage2D`, CLAMP_TO_EDGE + LINEAR, no mipmaps — non-POT-safe), cached per index, raw `/public` cover paths.

### `app/_components/WorkPreview/WorkPreview.tsx` + `_WorkPreview.module.scss` (moved + rebuilt, client)

Same shell behavior as today (portal to body, quickTo follow, rotation from velocity, fine-pointer + no-reduced-motion only, `aria-hidden`): canvas instead of the image stack when `createPreviewGL` succeeds; when it returns null, render the existing next/image crossfade stack as fallback. Mouse velocity from the existing `onMove` delta feeds `setVelocity`; row change calls `setActive`. rAF loop runs only while visible (`start()` on show, `stop()` on hide).

### `/work` wiring (edits)

`app/work/page.tsx`: wrap the `<ol>` in `<WorkPreview projects={workProjects}>`. `IndexRow.tsx`: accept `previewIndex` → `data-preview-index` (same pattern WorkRow used). Home no longer mounts any preview.

## D. Theme inversion scrub

### `app/_components/ThemeScrub/ThemeScrub.tsx` (new, client, renders an empty marker div)

Mounted inside `Footer` (every page ends with Footer). matchMedia no-preference: ScrollTrigger on the footer element (`markerRef.current.closest('footer')` or parentElement), `start: 'top 85%'`, `end: 'top 25%'`, `scrub: true`, tweening CSS custom properties on `html`:

| var             | light            | dark                  | contrast check               |
| --------------- | ---------------- | --------------------- | ---------------------------- |
| `--bg`          | #f5f0ec          | #0c0b0a               | —                            |
| `--fg`          | #0a0908          | #f5f0ec               | 17:1 on dark bg ✓            |
| `--fg-soft`     | rgba(10,9,8,.78) | rgba(245,240,236,.8)  | ≥9:1 ✓                       |
| `--fg-muted`    | rgba(10,9,8,.56) | rgba(245,240,236,.62) | ≥6:1 ✓                       |
| `--rule`        | rgba(10,9,8,.14) | rgba(245,240,236,.16) | decorative                   |
| `--rule-strong` | rgba(10,9,8,.32) | rgba(245,240,236,.36) | 3:1 UI ✓                     |
| `--paper`       | #ece6e0          | #161412               | —                            |
| `--paper-deep`  | #e3dcd4          | #1d1a17               | —                            |
| `--accent`      | #1f3a5f          | #8fb0d8               | large text ≥3:1 on #0c0b0a ✓ |
| `--accent-ink`  | #ffffff          | #10151c               | on #8fb0d8 ≥7:1 ✓            |

Cleanup on unmount/route change: kill trigger + `gsap.set('html', { clearProps: <all vars> })` so a navigation from a dark footer doesn't leak dark onto the next page. Reduced motion: no trigger, site stays light. Grep Footer/EndCTA SCSS for literal hex values that should be vars; promote if found.

### `Footer.tsx` (edit)

Render `<ThemeScrub />` as first child.

## E. Scramble micro-details

### `app/_components/ScrambleIn/ScrambleIn.tsx` (new, client, span)

Props: `text`, `className?`, `delay?`. On scroll into view (once, `top 90%`): `gsap.to(el, { scrambleText: { text, chars: '01<>/­_·', speed: 0.8 }, duration: 0.9 })`. Reduced motion / pre-trigger: plain text rendered from the start (scramble only ever rewrites the same string — no layout shift, SEO-safe since text is in markup).

Applied to: `SectionHead` index label, `PageIntro` label, Footer meta column headings if trivial. `CustomCursor`: when a cursor label is set, scramble it in (one 0.35s scrambleText tween, killed on label change).

## Accessibility checklist

- Gallery: links keep DOM order; focusin scroll-sync keeps the focused panel visible; vertical fallback for touch/reduced-motion/narrow; progress readout `aria-hidden` (decorative — the list semantics carry the count).
- Loader additions live inside the existing `aria-hidden` aside; no SR announcement changes.
- Canvas preview `aria-hidden` + `pointer-events: none`; GL failure falls back to images; no information is hover-only.
- Inversion pairs hold WCAG AA at both ends (table above) and at midpoints the scrub is transient; reduced-motion users never leave light mode.
- ScrambleIn renders final text in markup; animation only rewrites it.

## Commit sequence

1. `feat: loader assignment ceremony — counter, scramble status, variant stamp`
2. `feat: horizontal work gallery on home`
3. `feat: webgl distortion preview on work index`
4. `feat: theme inversion scrub at page end`
5. `feat: scramble-in micro details`

Each pushed; ship gauntlet + code-reviewer after 5.

## Known risks

- Pinned horizontal section is the largest layout change to home since launch; feel must be judged on a real trackpad (scrub: 1 vs true).
- `containerAnimation` parallax requires the same ScrollTrigger instance ordering — create panel triggers after the x tween.
- WebGL texture uploads of large PNG covers happen on first hover — lazy load + cache keeps the main thread cost off initial load; if jank appears, downscale via canvas before upload (note for review).
- Animating CSS vars on `html` invalidates style for the whole page per scrub tick — acceptable for a short scrub range; verify no scroll jank in dev.
