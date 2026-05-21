# Spec — Design tokens & shared SCSS partials (Phase 2)

**Status:** Draft — awaiting approval
**Date:** 2026-05-21
**Branch (when created):** `feature/design-tokens`
**Plan:** `_plans/design-tokens-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §3, §9, §10
**Source of truth (visual):** `Mainul's Portfolio/assets/shared.css` + inline `<style>` in `Mainul's Portfolio/index.html`

---

## 0. Recap

Fill in five existing TODO partials under `app/_styles/`. After this phase, every component module written from Phase 3 onward can reach for any colour, spacing value, type clamp, easing curve, or motif rule through the `additionalData` auto-import (which is already wired in `next.config.ts`).

No new files. No component CSS. No TS. No new deps.

## 1. Auto-import contract (read-only reference)

`next.config.ts` injects this into every `*.module.scss` outside `app/_styles/`:

```scss
@use 'variables' as *;
@use 'mixins' as *;
```

That means inside a component module you can write:

```scss
.thing {
  padding: 0 var(--gutter);
  font-family: var(--font-mono);
  @include fluid-type(1.6rem, 2.2vw, 2.4rem);
  @include reduced-motion-safe {
    transition: transform 0.4s var(--ease-out);
  }
}
```

…with no manual `@use` line.

Inside `_styles/*.scss` themselves, the loader **skips** the auto-import (so partials don't `@use` themselves). Each partial that needs tokens declares its own `@use 'variables' as *;`.

## 2. File-by-file specification

### 2.1 `app/_styles/_variables.scss`

**Purpose:** the one place every colour, type family, layout size, and easing curve is named. Custom properties only — they need to be runtime-swappable (the Tweaks panel re-writes `--accent` on `<html>`), so they must live on `:root`, not in SCSS scope.

**Final contents:**

```scss
:root {
  // --- Colour
  --bg: #f5f0ec;
  --fg: #0a0908;
  --fg-soft: rgba(10, 9, 8, 0.78);
  --fg-muted: rgba(10, 9, 8, 0.56);
  --rule: rgba(10, 9, 8, 0.14);
  --rule-strong: rgba(10, 9, 8, 0.32);
  --paper: #ece6e0;
  --paper-deep: #e3dcd4;
  --accent: #1f3a5f;
  --accent-ink: #ffffff;

  // --- Type families
  // next/font sets these as CSS variables on <html> already; the fallback chain
  // here matches the static template's declarations for safety on the first
  // paint before next/font's preload class lands.
  --font-display: 'Teko', 'Helvetica Neue', sans-serif;
  --font-body: 'Josefin Sans', 'Helvetica Neue', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  // --- Layout
  --container: 1640px;
  --gutter: clamp(20px, 4vw, 64px);
  --section-y: clamp(80px, 12vw, 200px);

  // --- Motion
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}

// Tablet (≤900px) — section-y shrinks
@media (max-width: 900px) {
  :root {
    --section-y: clamp(60px, 10vw, 140px);
  }
}

// Phone (≤640px) — gutter tightens, section-y pins
@media (max-width: 640px) {
  :root {
    --gutter: 22px;
    --section-y: 52px;
  }
}

// Very small phone (≤380px) — gutter tightens further
@media (max-width: 380px) {
  :root {
    --gutter: 18px;
  }
}

// 320px guardrail (masterplan §9 hard QA baseline) — floor the gutter so
// content never collides with viewport edge on first-gen iPhone SE.
@media (max-width: 320px) {
  :root {
    --gutter: 16px;
  }
}
```

**Notes:**

- The `next/font` CSS variables (`--font-display`, `--font-body`, `--font-mono`) declared on `<html>` in `app/layout.tsx` will take precedence over the `:root` fallbacks above on every modern browser, but the fallbacks keep paragraphs legible if next/font ever fails to inject (no FOUT into Times New Roman).
- `--accent` is intentionally a literal hex, not derived. The Tweaks panel rewrites it as `document.documentElement.style.setProperty('--accent', ...)`, and it needs a plain value to start from.
- No SCSS variables declared here. We don't need them yet — every token in this file works through `var(--token)`. If a future phase needs SCSS-scope numbers for math (e.g. computing a breakpoint width inside a `@function`), we add them in that phase.

**Edge cases:**

- Cascade order: the `@media` blocks are after the base `:root`, so the override wins inside the matched breakpoint. ✅
- An accent of `#0a0908` (the "Mono" preset = same as `--fg`) will make `::selection` background blend with body text. That's a known visual choice from the source; the Tweaks panel surfaces it as "Mono — no accent" and the selection on mono-mode shows light text on dark — which is the body fg colour against itself, so selection still reads (the foreground colour flips to `--accent-ink: #ffffff`). Not our problem here; it's correctly handled by `::selection { background: var(--accent); color: var(--accent-ink); }` in `globals.scss`.

---

### 2.2 `app/_styles/_mixins.scss`

**Purpose:** reusable Sass mixins. Inert until `@include`d, so safe to auto-import into every component module.

**Final contents:**

```scss
@use 'variables' as *;

// ---------------------------------------------------------------
// container
// Centred max-width wrapper with horizontal gutter.
// $narrow: true → 1100px max (FAQ on Contact, narrow case sections).
// ---------------------------------------------------------------
@mixin container($narrow: false) {
  width: 100%;
  max-width: if($narrow, 1100px, var(--container));
  margin: 0 auto;
  padding: 0 var(--gutter);
  position: relative;
}

// ---------------------------------------------------------------
// fluid-type
// Thin wrapper around clamp() to make intent explicit at the call
// site. Use when you want a fluid font-size between a min and a max
// driven by viewport width.
//
// $min : smallest font-size (e.g. 1.6rem) — used below $vw-min
// $vw  : the vw-relative middle term (e.g. 2.1vw)
// $max : largest font-size (e.g. 2.8rem) — used above $vw-max
// ---------------------------------------------------------------
@mixin fluid-type($min, $vw, $max) {
  font-size: clamp($min, $vw, $max);
}

// ---------------------------------------------------------------
// section-y
// Apply the responsive section vertical rhythm without the full
// `.section` class (e.g. on a component that needs the spacing but
// not the relative-positioning + extra wrappers).
// ---------------------------------------------------------------
@mixin section-y {
  padding-block: var(--section-y);
}

// ---------------------------------------------------------------
// reduced-motion-safe
// Wrap any non-essential transition/animation in this mixin so the
// rule only applies when the OS allows motion. Component modules
// should reach for this any time they author a transition.
//
//   .thing {
//     @include reduced-motion-safe {
//       transition: transform 0.4s var(--ease-out);
//     }
//   }
// ---------------------------------------------------------------
@mixin reduced-motion-safe {
  @media (prefers-reduced-motion: no-preference) {
    @content;
  }
}
```

**Notes:**

- Sass `if()` works here because we're calling it inside a mixin body — Dart Sass evaluates it at compile time per the SassScript spec. ✅
- `padding-block` (logical property) is fine — Next.js targets modern browsers per the Next 16 baseline; no need for `padding-top`/`padding-bottom` fallbacks.
- The mixin set is intentionally tiny. We do not pre-bake mixins like `@mixin display-xl` because the typography classes already give us those — adding a mixin shadow would just be two ways to say the same thing.

**Edge cases:**

- A component that sets a baseline transition then opts in to motion inside the mixin will have a non-animated style as the default — that's correct: anyone who turns reduced motion on gets the static base state.
- `clamp()` rounding: Sass passes `clamp()` through verbatim; values like `1.7rem` are emitted as-is (no decimal mangling).

---

### 2.3 `app/_styles/_typography.scss`

**Purpose:** the cross-page type system — mono captions, the display scale, body/paragraph rules, plus every breakpoint clamp-down. This partial is `@use`d once by `globals.scss` so its rules emit exactly once globally.

**Final contents:**

```scss
@use 'variables' as *;

// ===============================================================
// Mono caption — used for section labels, meta, ticks
// ===============================================================
.mono {
  font-family: var(--font-mono);
  font-size: 1.15rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 500;
}

.mono-sm {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  letter-spacing: 0.06em;
}

// ===============================================================
// Display type — Teko, condensed display
// ===============================================================
.display {
  font-family: var(--font-display);
  font-weight: 500;
  text-transform: uppercase;
  line-height: 0.85;
  letter-spacing: -0.005em;
}

.display.weight-300 {
  font-weight: 300;
}
.display.weight-600 {
  font-weight: 600;
}

.display-xl {
  font-size: clamp(8.4rem, 17vw, 27rem);
}
.display-lg {
  font-size: clamp(6.4rem, 11vw, 17rem);
}
.display-md {
  font-size: clamp(4.6rem, 7.5vw, 11rem);
}
.display-sm {
  font-size: clamp(3.6rem, 5.2vw, 8rem);
}
.display-xs {
  font-size: clamp(2.6rem, 3.6vw, 5.4rem);
}

// Stroked / outlined display variant
.outline {
  color: transparent;
  -webkit-text-stroke: 1.2px var(--fg);
}

// Lede / large intro paragraph
.lede {
  font-size: clamp(1.9rem, 2.1vw, 2.8rem);
  line-height: 1.35;
  max-width: 58ch;
  font-weight: 300;
}

// Paragraph base
p {
  margin: 0 0 1.6rem;
  max-width: 64ch;
}

p.large {
  font-size: clamp(1.8rem, 1.9vw, 2.4rem);
  line-height: 1.45;
}

// ===============================================================
// Responsive clamp-downs
// (Mirrors shared.css:606–790)
// ===============================================================

// Laptop-portrait — pre-empt overflow in the 900–1100px band
@media (max-width: 1100px) {
  .display-xl {
    font-size: clamp(5.6rem, 12vw, 14rem);
  }
  .display-lg {
    font-size: clamp(4.8rem, 9.5vw, 11rem);
  }
  .display-md {
    font-size: clamp(3.8rem, 7vw, 8rem);
  }
}

// Tablets
@media (max-width: 900px) {
  .display-xl {
    font-size: clamp(4.8rem, 11vw, 11rem);
  }
  .display-lg {
    font-size: clamp(4.2rem, 9vw, 9rem);
  }
}

// Phones
@media (max-width: 640px) {
  .lede {
    font-size: 1.6rem;
    line-height: 1.45;
  }
  p {
    margin-bottom: 1.2rem;
  }
  // Display sizes — only soft-wrap on overflow; never break mid-word
  .display {
    overflow-wrap: break-word;
    hyphens: manual;
  }
  .display-xl {
    font-size: clamp(3.8rem, 11vw, 8rem);
    line-height: 0.9;
  }
  .display-lg {
    font-size: clamp(3.4rem, 9vw, 6.4rem);
  }
  .display-md {
    font-size: clamp(2.8rem, 7.5vw, 5.2rem);
  }
  .display-sm {
    font-size: clamp(2.4rem, 6.5vw, 4.4rem);
  }
}

// Very small phones
@media (max-width: 380px) {
  .display-xl {
    font-size: clamp(3rem, 10vw, 6.4rem);
  }
}

// 320px guardrail — floor display-xl one more step so the hero
// title can never overflow on first-gen iPhone SE.
@media (max-width: 320px) {
  .display-xl {
    font-size: clamp(2.6rem, 10vw, 5.2rem);
  }
}
```

**Notes:**

- Body font-size and line-height are set in `globals.scss` (on `body`), not here, so they apply even when no class is present. The phone-breakpoint body shrink (`body { font-size: 1.5rem; line-height: 1.5; }` at ≤640px) also lives in `globals.scss`. This partial is for class-level type, not element-level.
- Display-xl gets one extra clamp-down at 320px that doesn't exist in the source. Source's `shared.css:784` already has `.display-xl { font-size: clamp(3rem, 10vw, 6.4rem); }` at ≤380px which is _almost_ but not quite enough at 320px (max 6.4rem × 320px = ~28% of width per char, OK; min 3rem = 30px which is still a touch tall for "Frontend / Developer / & Experiments" stacked on three lines). The 320px override drops the floor to 2.6rem and the cap to 5.2rem. **Decision point — flag if you'd rather match source exactly.**
- `.display.weight-300` and `.display.weight-600` exist because `shared.css:94–95` defines them. They're used by case heroes and the footer wordmark (Phase 3 / Phase 6). Cheap to ship now, expensive to track down later.
- `overflow-wrap: break-word` on `.display` at ≤640px is what prevents a long word like "Experiments" from blowing out the viewport. `hyphens: manual` means we don't auto-hyphenate — we'd only break where a `&shy;` lives. ✅ matches source `shared.css:644–647`.

**Edge cases:**

- A page heading wearing both `.display.display-xl.outline` will render transparent text with a stroke and the largest clamp. Font-weight 500 vs 300 vs 600 stacks correctly because of CSS specificity (all single-class selectors). ✅
- A `.lede` inside a paragraph (nested) — `<p class="lede">…</p>` — picks up the lede font-size but also the p `margin-bottom: 1.6rem` (or `1.2rem` on phone). That matches the source. ✅

---

### 2.4 `app/_styles/_utils.scss`

**Purpose:** the small set of layout primitives + accessibility helpers + one decorative motif. `@use`d once from `globals.scss`.

**Final contents:**

```scss
@use 'variables' as *;
@use 'mixins' as *;

// ===============================================================
// Container
// ===============================================================
.container {
  @include container;
}

.container--narrow {
  @include container($narrow: true);
}

// ===============================================================
// Section
// ===============================================================
.section {
  @include section-y;
  position: relative;
}

.section__head {
  display: flex;
  align-items: baseline;
  gap: 24px;
  border-top: 1px solid var(--fg);
  padding-top: 18px;
  margin-bottom: clamp(40px, 6vw, 96px);
}

.section__index {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.section__title {
  font-family: var(--font-display);
  font-size: clamp(2.6rem, 3vw, 4.4rem);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  margin: 0;
  line-height: 1;
}

.section__title .accent {
  color: var(--accent);
}

// ===============================================================
// Tick rule — horizontal hairline with 21 vertical marks
// (every 5th mark taller + darker)
// ===============================================================
.tick-rule {
  display: flex;
  align-items: center;
  height: 12px;
  position: relative;
}

.tick-rule::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  height: 1px;
  top: 50%;
  background: var(--rule-strong);
}

.tick-rule__marks {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.tick-rule__marks span {
  width: 1px;
  height: 8px;
  background: var(--rule-strong);
  display: block;
}

.tick-rule__marks span:nth-child(5n + 1) {
  height: 12px;
  background: var(--fg);
}

// ===============================================================
// Accessibility — visually hidden but readable to screen readers
// ===============================================================
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

// ===============================================================
// Phone responsive — section heads stack
// ===============================================================
@media (max-width: 640px) {
  .section__head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding-top: 14px;
    margin-bottom: 32px;
  }

  .section__title {
    font-size: 2.8rem;
    line-height: 1;
  }

  .section__index {
    font-size: 0.95rem;
  }
}

// Very small phones — section title tightens once more
@media (max-width: 380px) {
  .section__title {
    font-size: 2.4rem;
  }
}
```

**Notes:**

- `.tick-rule` markup is intended to be `<div class="tick-rule" aria-hidden="true"><div class="tick-rule__marks"><span>×21</span></div></div>`. The Phase 3 `<TickRule>` component renders exactly that.
- `.section--first` was in the original TODO but isn't in the source CSS. The masterplan calls for an optional `firstChild` prop on `<Section>` (Phase 3) that drops top padding — we'll add that as `.section--first { padding-top: 0; }` when the `<Section>` component lands, not now.
- `.container--narrow` is two classes deep (`.container.container--narrow`) in the source; here it's a single class that pulls in the same rules via the mixin. Functionally identical because the mixin's `if($narrow, 1100px, var(--container))` returns `1100px` for `--narrow`. ✅

**Edge cases:**

- `.sr-only` uses the legacy `clip: rect(0 0 0 0)` rather than the newer `clip-path: inset(50%)`. Both work; the source uses `clip:` so we match. Modern screen readers parse either.
- `.tick-rule` width: it stretches to fill its parent flex/grid cell. If the parent is too narrow (<200px), the 21 marks crowd together but never overflow because of `justify-content: space-between`. Phase 3 / Phase 4 hero usage places it in a 1fr grid column at desktop, hidden at ≤900px (per source `index.html:225`); no breakage.

---

### 2.5 `app/_styles/globals.scss`

**Purpose:** the only file imported into `app/layout.tsx`. Emits the reset, base body styles, page-intro block, named keyframes, and the global reduced-motion override exactly once.

**Final contents:**

```scss
@use 'variables' as *;
@use 'typography' as *;
@use 'utils' as *;

// ===============================================================
// Reset
// ===============================================================
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 62.5%; // 1rem = 10px
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body), system-ui, sans-serif;
  font-size: 1.7rem;
  line-height: 1.45;
  font-weight: 400;
  overflow-x: hidden;
  text-wrap: pretty;
}

::selection {
  background: var(--accent);
  color: var(--accent-ink);
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}

// Disable default `details` marker (FAQ uses a custom marker — see Phase 5)
details summary {
  list-style: none;
}
details summary::-webkit-details-marker {
  display: none;
}

// ===============================================================
// Page intro block (Work / About / Contact / Cases)
// ===============================================================
.page-intro {
  padding-top: calc(var(--section-y) * 0.9);
  padding-bottom: 40px;
  position: relative;
}

.page-intro__label {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-intro__label::before {
  content: '';
  width: 32px;
  height: 1px;
  background: var(--accent);
}

.page-intro__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(8.4rem, 17vw, 26rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: -0.01em;
  overflow-wrap: break-word;
}

.page-intro__sub {
  font-size: clamp(1.8rem, 1.6vw, 2.2rem);
  max-width: 60ch;
  margin-top: 32px;
  color: var(--fg-soft);
}

// Page-intro responsive (mirrors shared.css:613, 628, 707–715, 785)
@media (max-width: 1100px) {
  .page-intro__title {
    font-size: clamp(5.6rem, 13vw, 16rem);
  }
}

@media (max-width: 900px) {
  .page-intro__title {
    font-size: clamp(4.8rem, 12vw, 13rem);
  }
}

@media (max-width: 640px) {
  body {
    font-size: 1.5rem;
    line-height: 1.5;
  }

  .page-intro {
    padding-top: 70px;
    padding-bottom: 20px;
  }

  .page-intro__title {
    font-size: clamp(3.6rem, 11vw, 8rem);
    line-height: 0.92;
    overflow-wrap: break-word;
  }

  .page-intro__sub {
    font-size: 1.45rem;
    margin-top: 18px;
  }

  .page-intro__label {
    font-size: 0.95rem;
    margin-bottom: 16px;
  }

  .page-intro__label::before {
    width: 24px;
  }
}

@media (max-width: 380px) {
  .page-intro__title {
    font-size: clamp(3rem, 10vw, 6.4rem);
  }
}

// 320px guardrail
@media (max-width: 320px) {
  .page-intro__title {
    font-size: clamp(2.6rem, 10vw, 5.2rem);
  }
}

// ===============================================================
// Named keyframes
// (Declared globally so component modules can `animation: rise …`
// without redeclaring. Emitted exactly once because globals.scss
// is imported once from app/layout.tsx.)
// ===============================================================

@keyframes rise {
  to {
    transform: translateY(0);
  }
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

@keyframes nav-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.65;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes scroll-bar {
  0% {
    background-position: 100% 0;
  }
  50% {
    background-position: 0 0;
  }
  100% {
    background-position: -100% 0;
  }
}

// ===============================================================
// Reduced-motion safety net
// Kills the named animations + suppresses reveal-on-scroll
// transform for users with prefers-reduced-motion: reduce.
// Per accessibility.md and masterplan §3.4.
// ===============================================================
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }

  // Reveal targets stay visible — never trapped invisible.
  .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

**Notes:**

- `text-wrap: pretty` is supported in Safari 17.4+ / Chrome 117+ / Firefox 132+ — the static template uses it, so do we. Older browsers ignore it (no fallback needed; degrades to normal wrapping).
- `details` marker reset lives here (single rule pair) because both the FAQ on Contact and any case-page collapsible blocks may use `<details>`. Cheap to ship now.
- The reduced-motion override uses `0.001ms` rather than `0s` because some engines treat `0s` durations as "skip event firing" which breaks `animationend` listeners. The static template doesn't take this trick; we add it because the masterplan says we must respect the OS setting AND the Phase 4 `<Hero>` uses `animationend` to coordinate the variant toggle re-entry.
- `.reveal` override is the safety net the plan called out — even if a component module forgets to wrap its `.reveal` transform in `reduced-motion-safe`, this catches it.

**Edge cases:**

- The keyframe block is inside `globals.scss` (single import) so it emits once. If we ever switch to importing globals into a component module too, we'd double-emit. We don't, and the file's docstring should not encourage it. Phase 3 onward only imports `globals.scss` from `app/layout.tsx`.
- `text-wrap: pretty` + `overflow-x: hidden` on `body` interact well — no horizontal scrollbar even when a `.display-xl` line is at its maximum clamp. Confirmed in source.
- `::selection` over an outlined (`color: transparent`) display heading paints the stroke colour as the selection foreground (the stroke is the only visible thing). Visually fine; just noting it.

## 3. Order of work + commits inside the feature branch

Once the spec is approved and the branch is cut, the implementation can land as a single commit since this is all SCSS surface and the partials cross-reference each other. Suggested message:

```
feat: port design tokens, typography, utilities, and motion
```

If we'd rather split for reviewability:

1. `feat: port :root tokens and breakpoint overrides to _variables.scss`
2. `feat: port reusable mixins (container, fluid-type, section-y, reduced-motion-safe)`
3. `feat: port typography scale and responsive clamps`
4. `feat: port layout utilities, sr-only, and tick-rule`
5. `feat: port reset, page-intro, keyframes, and reduced-motion safety to globals.scss`

I'd default to the single commit unless you'd rather see the steps. Flag below if so.

## 4. Verify steps

Run from `/Users/mainul/Desktop/Practice_Projects/Portfolio`:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

In the browser:

1. Open `http://localhost:3000`. Confirm the body has the cream `#f5f0ec` background and Josefin Sans body type (use DevTools → Computed → `font-family` to confirm).
2. Triple-click any text and confirm the selection paints navy with white text.
3. Resize the viewport to 1640, 1280, 1100, 900, 768, 640, 480, 380, 320. At each width, scroll horizontally — there should be no horizontal scrollbar. `<html>` should still have the right `font-size: 62.5%`.
4. In DevTools → Rendering, set `prefers-reduced-motion: reduce`. The page (still a placeholder) should not error; `body` keeps painting; `scroll-behavior` becomes `auto`.
5. Drop a temporary `<div className="tick-rule"><div className="tick-rule__marks">{Array.from({length:21}).map((_,i)=><span key={i}/>)}</div></div>` into `app/page.tsx` and confirm the 21-mark rule renders with every 5th mark taller and darker. **Remove it before committing.**
6. Drop a temporary `<h1 className="display display-xl">Hello</h1>` + `<h2 className="display display-md outline">Outlined</h2>` and confirm the typography matches the source. **Remove before committing.**

After verifying, run `/ship` for the typecheck/lint/build gauntlet, push, and stop. No PR yet — that's `/finish-feature`.

## 5. Accessibility considerations

- `.sr-only` is the standard recipe — sized 1×1, clipped, no margin/padding leak — and is the only legitimate way to hide content from sighted users without hiding it from assistive tech.
- The reduced-motion override hits every element with an `animation-duration` or `transition-duration`. Components built in later phases will _still_ author motion (they have to — that's what the design is), but the override floors all of them to ~0ms whenever the user has opted out. This is the masterplan §3.4 promise.
- Selection contrast (navy on cream highlight area → white text on navy fill) is WCAG AAA at 11:1. ✅
- Body colour `--fg` on `--bg` is 17.4:1. ✅ AAA for body, AAA for large text.
- `--fg-muted` (`rgba(10, 9, 8, 0.56)`) on `--bg` is approx 5.0:1 — AA pass for body, AAA for large. Used only for meta/labels (which are mono and small but at AA they're legal). If anything below body text uses `--fg-muted`, we'll catch it in a Lighthouse pass later.
- No `tabindex`, `role`, or interactive markup is introduced here. There is nothing to keyboard-test in this phase.

## 6. Edge cases consolidated

| Case                                                         | Handling                                                                                                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FOUT before next/font hydrates                               | `:root` declares fallback font-family stacks; Josefin Sans falls back to Helvetica Neue → sans-serif. No layout shift visible.                                          |
| Browser without `text-wrap: pretty`                          | Degrades to normal wrapping. Decorative, not load-bearing.                                                                                                              |
| Browser without `color-mix()`                                | Not used in any partial here. `color-mix()` is referenced in source CSS for nav scrolled background and tweaks toggles — those are Phase 3/4 component scope.           |
| 320px viewport                                               | Gutter floors at 16px, display-xl clamps to 2.6rem–5.2rem, page-intro\_\_title same. Hero text will not overflow.                                                       |
| User toggles `prefers-reduced-motion` mid-session            | The `@media (prefers-reduced-motion: reduce)` block re-evaluates live in Chrome/Firefox/Safari. No JS needed.                                                           |
| Component module imports `_variables.scss` manually          | Will work — but redundant given `additionalData`. Lint rule for this is out of scope; we trust convention.                                                              |
| `.section` placed at the top of a page                       | Currently picks up the full `var(--section-y)` top padding. A future `.section--first { padding-block-start: 0; }` override lands with `<Section>` component (Phase 3). |
| A `details` element on `/contact`                            | Marker hidden globally; the FAQ component (Phase 5) supplies its own.                                                                                                   |
| `globals.scss` imported anywhere other than `app/layout.tsx` | Would double-emit keyframes + reset. Convention only; no enforcement.                                                                                                   |

## 7. Exit criteria

- `_variables.scss`, `_mixins.scss`, `_typography.scss`, `_utils.scss`, `globals.scss` all contain the contents specified above (no TODO comments left).
- `npm run build` is green.
- `npm run lint` is clean.
- `npx tsc --noEmit` is clean.
- Dev server boots; `/` renders on cream background with Josefin body type.
- Every `:root` token from `shared.css:7–29` is present in `_variables.scss`.
- Every responsive override (1100, 900, 640, 380) from `shared.css` is preserved across `_variables.scss` (for `--section-y`, `--gutter`), `_typography.scss` (for display sizes), `_utils.scss` (for `.section__head`/`.section__title`), and `globals.scss` (for `body` font-size + `.page-intro__*`).
- Every named keyframe from masterplan §3.4 (`rise`, `fade-in`, `nav-pulse`, `spin`, `marquee`, `scroll-bar`) exists in `globals.scss`.
- `prefers-reduced-motion: reduce` override is in place and tested in DevTools.
- 320px guardrail is in place for `--gutter`, `.display-xl`, `.page-intro__title`, and `.section__title`.
- `futureWorks.md` gets at most one line if a clamp ends up needing a future tweak.

## 8. Out of scope (defer to later phases)

- `.reveal` / `.is-inview` rules (Phase 3 — landed with `<Reveal>` + `<RevealRoot>`)
- `.btn`, `.btn--ghost`, `.btn--accent`, `.tlink` (Phase 3 — landed with `<Button>` + `<TextLink>` modules)
- `.nav`, `.nav__*`, `.footer`, `.footer__*` (Phase 3)
- `.cursor` (Phase 3)
- `.tweaks`, `.tweaks__*` (Phase 4)
- `.hero`, `.hero__*`, `.marquee`, `.marquee__*`, `.intro__*`, `.stats`, `.services`, `.work-list`, `.client-grid`, `.awards`, `.xp-list`, `.endcta` (Phase 4)
- `.case-hero`, `.case-meta`, `.case-block`, `.case-visuals`, `.code-mock`, `.next-case`, `.countries` (Phase 6)
- `.about-bio`, `.skills`, `.personal`, `.resume` (Phase 5)
- `.contact-aside`, `.direct`, `.form`, `.faq__item` (Phase 5)
- `.section--first` modifier (Phase 3, with `<Section>`)
- `color-mix()` usages (component scope)
