# Motion pass — technical spec

Pairs with `_plans/motion-pass-plan.md`. Each stage below maps to one PR off `main`.

---

## Scope summary

| Stage | What ships                                                           | Branch                         |
| ----- | -------------------------------------------------------------------- | ------------------------------ |
| 1     | Page-transition curtain via View Transitions API + rotating messages | `feature/motion-1-transitions` |
| 2     | Contextual cursor labels (upgrade existing `CustomCursor`)           | `feature/motion-2-cursor`      |
| 3     | Work-index row hover choreography                                    | `feature/motion-3-row-hover`   |
| 4     | Hero word-stagger + `SectionHead` reveal + case-study body reveal    | `feature/motion-4-reveals`     |

Each stage ships independently. Order chosen by impact: Stage 1 is the biggest perceived change for the "feels flat" feedback.

---

## Stage 1 — Page-transition curtain

### Approach

Use the browser-native View Transitions API, wired through Next 16's experimental `viewTransition` config. Reason for not retrying GSAP click-intercept: the previous attempt in `feature/page-transitions` (logged in futureWorks) failed because the click-to-paint handoff couldn't be made smooth. View Transitions delegates that timing to the browser.

Two implementation paths to evaluate (spec leaves the choice to implementation, picked after a 30-min spike):

- **Path A (preferred):** `experimental.viewTransition` flag in `next.config.ts` + `<ViewTransition>` (from `react`, experimental) wrapping the App Router children. Curtain element gets a `view-transition-name` so it persists across navigations and runs the message rotation between snapshots.
- **Path B (fallback):** Manual `document.startViewTransition()` intercept on a custom `<Link>` wrapper. More control, more wiring. Use only if Path A doesn't behave on real builds.

If both paths fail, ship Stages 2–4 and reopen the futureWorks entry; do not attempt a third GSAP click-intercept.

### Files

**New:**

- `app/_components/PageCurtain/PageCurtain.tsx` — client component. Renders the curtain panel + message slot. Mounted at root layout.
- `app/_components/PageCurtain/_PageCurtain.module.scss` — curtain styling, `view-transition-name`, message typography, prefers-reduced-motion guard.
- `app/_lib/curtain-messages.ts` — typed message catalogue + picker function.

**Edited:**

- `next.config.ts` — add `experimental: { viewTransition: true }` (Path A) — guarded comment noting it's experimental.
- `app/layout.tsx` — mount `<PageCurtain />` between `<Loader />` and the skip-link; wrap `<main>` children in `<ViewTransition>` (Path A only).

### Curtain message catalogue

`app/_lib/curtain-messages.ts` exports:

```ts
export type CurtainMessageKind = 'personality' | 'experiment' | 'functional';

export type CurtainMessage = {
  text: string;
  kind: CurtainMessageKind;
};

export const CURTAIN_MESSAGES: readonly CurtainMessage[] = [
  // Personality (carries old portfolio's voice — ~60% of pool by repetition weight)
  { kind: 'personality', text: 'Almost there…' },
  { kind: 'personality', text: 'Please wait…' },
  { kind: 'personality', text: 'Wow, you are here!' },
  { kind: 'personality', text: 'You made it.' },
  // Experiment voice (on-brand for an A/B testing specialist — ~30%)
  { kind: 'experiment', text: 'Variant A is loading…' },
  { kind: 'experiment', text: 'Hypothesis: you’ll like this one' },
  { kind: 'experiment', text: 'Stat sig: pending…' },
  { kind: 'experiment', text: 'Running the test…' },
  // Functional (~10% — orientation for users who want it)
  { kind: 'functional', text: 'Next: {{route}}' },
] as const;

export function pickCurtainMessage(destinationLabel?: string): string;
```

`pickCurtainMessage` chooses uniformly at random from `CURTAIN_MESSAGES` and, if a `functional` message is picked and `destinationLabel` is provided, substitutes `{{route}}`. Functional pool is excluded if `destinationLabel` is empty.

Weighting is achieved by repetition in the array (avoids a separate weight field for now — promote to weighted picker if the mix needs tuning later).

### Animation shape

- Curtain colour: solid `var(--color-ink)` (the brand dark) sweeping from bottom to top, sized 100vw × 100vh, fixed position, `z-index` above main content but below the `Loader`.
- Duration target: 360–480 ms total (180–240 ms enter, 180–240 ms exit). Tuned during implementation to avoid the "perceived lag" symptom from the previous attempt.
- Message: centered, large display type (`var(--font-display)`), white. Fades in at ~50% of enter, fades out before exit.
- prefers-reduced-motion: curtain renders but with `display: none` swap-only (no enter/exit animation); the navigation still proceeds instantly. No reduced-motion alternative is needed — the goal is "no motion," not "different motion."

### Edge cases

- **Hash-only navigation** (`/about#contact`) — skip the curtain. Detect via `next/link` `prefetch`/`hash` differences or a `data-no-curtain` opt-out on the link.
- **Same-route navigation** (clicking the current route's link) — skip the curtain.
- **404 → home** — curtain applies normally.
- **External links** — never curtain. Easy via `target="_blank"` or absolute URL check.
- **Mobile** — curtain still runs on route change; not cursor-dependent. Test on iOS Safari (which only got View Transitions in recent versions — confirm during implementation).
- **First load** — `Loader` handles first-load splash. Curtain only runs on subsequent navigations.

### Accessibility

- Curtain element: `aria-hidden="true"` while animating (the destination page's content is what announces, via the `<h1>` in `PageIntro`).
- `prefers-reduced-motion: reduce` — curtain skips animation, route change still works.
- Focus management — the destination page's main landmark should receive focus naturally on route change (Next App Router default). No manual focus trap needed.
- No screen-reader announcement of the message text — these are decorative.

---

## Stage 2 — Contextual cursor labels

### Approach

Upgrade `app/_components/CustomCursor/CustomCursor.tsx`. Today it's a small ring that toggles a `.isHover` class when over `a, button, [data-cursor="hover"]`. Refactor to:

1. Track the **current label** (string, possibly empty) in component state.
2. When entering an interactive target, read its label and render it inside the disc.
3. When leaving, clear the label and shrink the disc back to the dot.

Label source priority (first hit wins):

1. `data-cursor-label="..."` on the target (explicit, preferred)
2. `aria-label` on the target
3. Trimmed `textContent` of the target, capped at 14 characters with ellipsis

If none of the above yields a non-empty string, the cursor stays in dot mode (no label) but still gets the hover scale-up.

### Files

**Edited:**

- `app/_components/CustomCursor/CustomCursor.tsx` — add label state, label resolution, label render slot.
- `app/_components/CustomCursor/_CustomCursor.module.scss` — disc size variant for labeled state, label typography, smooth size + colour transition.
- `app/_components/Nav/Nav.tsx` — add `data-cursor-label` to each nav link (`About`, `Work`, `Contact`).
- `app/_components/home/SelectedWork/...` — `data-cursor-label="Open"` on each row.
- `app/work/_components/IndexRow/IndexRow.tsx` — `data-cursor-label="Open"` (it already has `data-cursor="hover"`; extend it).
- `app/_components/Button/Button.tsx` — accept an optional `cursorLabel` prop that maps to `data-cursor-label` on the rendered element; default falls back to the button's textContent via the cascade above.
- `app/_components/TextLink/...` — same treatment as `Button`.

### Label catalogue (style guide)

| Element type                      | Label                                                                   |
| --------------------------------- | ----------------------------------------------------------------------- |
| Top-nav links                     | `"About"`, `"Work"`, `"Contact"`, `"Home"`                              |
| Selected-work rows on home        | `"Open"`                                                                |
| Work-index rows                   | `"Open"`                                                                |
| Primary CTAs                      | `"Say hi"`, `"Get in touch"`, `"Send"`, etc. (per existing button copy) |
| External links (LinkedIn, GitHub) | `"Open ↗"`                                                              |
| In-text reading links             | no `data-cursor-label` — cascade falls to textContent                   |

### Animation shape

- Dot state: 12 px circle, transparent fill, 1.5 px ring in `var(--color-ink)`.
- Labeled state: ~56–72 px disc (auto-fit to label width), solid `var(--color-ink)` fill, white text.
- Transition: 220 ms `cubic-bezier(0.22, 1, 0.36, 1)` on size, fill, and label opacity.
- Position lerp stays as today (RAF + 0.22 easing).

### Edge cases

- **Nested interactive elements** (link inside a button — shouldn't happen in this codebase but defensive) — `closest('a, button, [data-cursor="hover"]')` already picks the innermost.
- **Label longer than 14 chars** — truncate with ellipsis. If this happens often, tune up the cap.
- **Cursor leaving the window** — current `mouseout` handler clears the label too.
- **External links** — get `"Open ↗"` to differentiate from internal navigation.
- **Touch / coarse pointer** — entire component remains unmounted (existing `useSyncExternalStore` guard on `(hover: hover) and (pointer: fine)`).

### Accessibility

- Cursor is `aria-hidden="true"` (already is). Label is purely visual.
- `data-cursor-label` is a styling/JS hint, not a replacement for accessible names — every element that gets one still needs proper text content or `aria-label` for screen readers.
- `prefers-reduced-motion: reduce` — keep label swap, drop the size animation (size change is a transform on hover; turn off the transition).

---

## Stage 3 — Work-index row hover choreography

### Approach

Today `IndexRow` is a flat link with number + title + meta + tags + year + arrow on a row. On hover, almost nothing visible changes. Add a layered hover state:

1. Arrow slides right by ~12 px and increases opacity.
2. Title shifts subtly left (~6 px) creating a parallax against the arrow.
3. Optional (decide during implementation): a thin coloured underline sweeps left-to-right under the row.
4. The row's tags mute slightly (opacity dip) to focus the eye on the title.

All transforms via CSS, not GSAP — these are simple hover transitions and don't need a JS timeline.

### Files

**Edited:**

- `app/work/_components/IndexRow/_IndexRow.module.scss` — extend `:hover` styles, add transitions, prefers-reduced-motion guard.
- `app/work/_components/IndexRow/IndexRow.tsx` — add `data-cursor-label="Open"` if not done in Stage 2.

### Animation shape

- Arrow: `transform: translateX(12px)`, opacity 1, 280 ms `cubic-bezier(0.22, 1, 0.36, 1)`.
- Title: `transform: translateX(-6px)`, 280 ms, same easing.
- Underline (if shipped): `transform-origin: left center; transform: scaleX(0) → scaleX(1)` over 360 ms.
- Tags: opacity 0.6, 220 ms.

### Edge cases

- **Touch devices** — `@media (hover: hover)` guard so taps don't show a phantom hover state.
- **Keyboard focus** — `:focus-visible` mirrors the hover state so it works with tab navigation too.
- **prefers-reduced-motion** — disable transitions, keep the end state (so keyboard focus is still visible).

### Accessibility

- The arrow already has `aria-hidden="true"`. Hover/focus mirror keeps keyboard parity.
- `:focus-visible` outline + the hover-mirror states keep the row legible without mouse.

---

## Stage 4 — Hero word-stagger + section + case-study reveals

### Approach

Three sub-tasks, all GSAP-based (extends the existing `motion.ts` setup; no new libs):

**4a. Hero word-stagger**
Today `Hero.tsx` uses `yPercent: 110` mask reveal on three display elements (`d1`, `d2`, `d3`) — full-line reveals. Replace with per-word stagger inside each of those lines:

- Refactor `HeroVariantA` / `HeroVariantB` to wrap each word of the display copy in a `<span class={styles.word}><span class={styles.wordInner}>{word}</span></span>`.
- In `Hero.tsx`'s `useGSAP` block, replace the three `.from(.d1, ...)` calls with a single `.from(.wordInner, { yPercent: 110, duration: 0.9, stagger: 0.04 }, 0.15)`.
- Hand-rolled word split — no GSAP SplitText commercial dep.

**4b. SectionHead reveal**
`SectionHead` is currently a plain server component. Make it a small client wrapper around a `Reveal`-style animation (reuse the existing `Reveal` if its `delay` shape fits; otherwise inline a tiny GSAP timeline scoped to the header). The index number and title get a quick layered reveal on scroll.

**4c. Case-study body reveals**
The case template (`app/work/_components/case/...`) already uses `<Reveal>` in places. Audit each section and stage them tighter — pin the hypothesis → variant → result arc so each block enters on its own, not all at once. This is mostly tweaking existing `Reveal` placements + `delay` values; only minimal new code.

### Files

**New:**

- `app/_components/SectionHead/SectionHead.tsx` — promote to client component with `useGSAP` inside; or wrap the existing markup in a thin `<Reveal>`. Decide during implementation based on which keeps existing pages green.

**Edited:**

- `app/_components/home/Hero/HeroVariantA.tsx` and `HeroVariantB.tsx` — split display copy into per-word spans.
- `app/_components/home/Hero/Hero.tsx` — update GSAP timeline to word-stagger.
- `app/_components/home/Hero/_Hero.module.scss` — add `.word`, `.wordInner` styles + `overflow: hidden` mask on `.word`.
- `app/work/_components/case/CaseHero.tsx` and siblings — review and adjust `<Reveal>` usage.
- Possibly: case page templates (`app/work/*/page.tsx`) where they render hypothesis/variant/result blocks.

### Animation shape

- Hero words: `yPercent: 110` mask, 0.9s, `expo.out`, 0.04s stagger. Total reveal: ~1.5s for a typical 8-word headline.
- SectionHead: index fades in (220ms), title yPercent 80 → 0 (650ms, `expo.out`), 60ms stagger.
- Case-study body: existing `Reveal` shape (opacity + y28, 900ms `expo.out`) — keep as is, just tighten placement.

### Edge cases

- **Variant toggle on hero** — when the user switches variant, the new variant should re-animate from scratch. The existing `useGSAP({ dependencies: [variant] })` already handles this; verify it still works post-refactor.
- **Reduced-motion** — all three sub-tasks must guard via `gsap.matchMedia()`. Existing `Reveal` / `PageIntro` patterns are the template.
- **SectionHead on `/work` index** — verify the reveal doesn't fire before the page content is ready (ScrollTrigger handles this but it's worth a manual check).

### Accessibility

- Per-word spans don't break selection or copy-paste (each word is still text content).
- Reduced motion → static end state (no movement, full opacity, no mask).
- Heading semantics preserved — `<h1>`, `<h2>` etc. stay; spans are inside.

---

## Cross-stage concerns

### Reduced motion

All four stages must respect `prefers-reduced-motion: reduce`. The existing pattern (`gsap.matchMedia('(prefers-reduced-motion: no-preference)')`) is the template. Each stage's spec section includes its reduced-motion behaviour explicitly.

### Verification (per stage)

Each stage's PR must pass `/ship` (typecheck + lint + build) and a manual visual pass:

1. Tab through every interactive element on the changed pages (cursor labels especially).
2. Toggle the OS reduced-motion preference and confirm static end states.
3. Test on `npm run dev` in Chrome + Safari (View Transitions in Safari is a known unknown — verify Stage 1 behaviour explicitly).
4. Lighthouse accessibility pass on home and a case study page after Stage 4 (motion should not regress AAA score).

### Telemetry

None added. Motion behaviour is observed visually; no metrics collected. (If a future stage adds horizontal scroll, revisit.)

### Risks

- **Stage 1: View Transitions in Next 16 is experimental** — if both Path A and Path B don't behave, ship Stages 2–4 and reopen the futureWorks "page-transition" entry with new findings.
- **Stage 1: Safari support** — Safari 18+ has View Transitions for same-document. Cross-document support is newer. If Safari falls back to instant navigation, that's acceptable — degrades gracefully.
- **Stage 4: variant toggle interaction** — refactoring the hero into per-word spans could break the existing variant-toggle re-animation. Verify before merging.

### Things deferred to follow-ups (not in this pass)

- Horizontal scrolling moments (work index, case studies).
- Background watermark / easter-egg text.
- Custom cursor on inline body text (intentionally out — dilutes signal).
- Fake "loading padding" beyond what the browser needs.
- Cursor label localisation (English only for now).

---

## Plan ↔ spec mapping

| Plan stage                                     | Spec stage | Branch                         |
| ---------------------------------------------- | ---------- | ------------------------------ |
| Page-transition curtain with rotating messages | Stage 1    | `feature/motion-1-transitions` |
| Contextual cursor labels                       | Stage 2    | `feature/motion-2-cursor`      |
| Work-grid hover choreography                   | Stage 3    | `feature/motion-3-row-hover`   |
| Text and section reveal pass                   | Stage 4    | `feature/motion-4-reveals`     |
