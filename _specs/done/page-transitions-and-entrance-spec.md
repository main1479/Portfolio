# Page transitions + entrance animations — spec

Technical breakdown for the plan at `_plans/page-transitions-and-entrance-plan.md`.

---

## Architecture summary

Three coordinated pieces, all using GSAP (already a dep — `gsap`, `@gsap/react`):

1. **`PageTransition`** — a fixed-position panel that slides up from below to cover the screen, then continues up to reveal the new page. Triggered by `usePathname()` changes.
2. **`app/template.tsx`** — a Next.js `template` (which remounts on every navigation, by design) that applies a "page-enter" fade-up to its child wrapper. Replaces the per-page entrance gap.
3. **`PageIntro` becomes a client component** — adds a title-reveal animation (yPercent slide-up from below an `overflow: hidden` clip) plus label/sub fade-ins on mount.

`Loader` is simplified — its first-load wordmark splash stays; the in-loader `routeBar` (1px hairline) is removed and replaced by the new `PageTransition`.

---

## Files to create

### 1. `app/_components/PageTransition/PageTransition.tsx`

Client component. Watches `usePathname()`. On every change after the first render, plays a panel-in → panel-out GSAP timeline. Skipped on the initial render (the existing `Loader` handles first load) and skipped when either the current or previous route is `/cv`.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from '../../_lib/motion';
import styles from './_PageTransition.module.scss';

export function PageTransition() {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathname.current = pathname;
      return;
    }

    const involvesCv = pathname === '/cv' || prevPathname.current === '/cv';
    prevPathname.current = pathname;
    if (involvesCv) return;

    const panel = panelRef.current;
    if (!panel) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
      },
    });

    tl.set(panel, { display: 'block', yPercent: 100 });
    tl.to(panel, { yPercent: 0, duration: 0.35, ease: 'expo.inOut' });
    tl.to(panel, { yPercent: -100, duration: 0.4, ease: 'expo.inOut' }, '+=0.05');
    tl.set(panel, { display: 'none' });
  }, [pathname]);

  return <div ref={panelRef} className={styles.panel} aria-hidden="true" />;
}
```

### 2. `app/_components/PageTransition/_PageTransition.module.scss`

```scss
.panel {
  position: fixed;
  inset: 0;
  z-index: 998; // below Loader (999), above all content
  background: var(--fg);
  display: none;
  pointer-events: none;
  transform: translateY(100%);
  will-change: transform;
}

// Belt-and-braces: never let the panel appear in print
@media print {
  .panel {
    display: none !important;
  }
}
```

**Why `z-index: 998`** — the existing `Loader` uses `999`, and we want the first-load splash to sit on top if both are ever active in the same frame.

**Why `var(--fg)`** — solid ink, on-brand, visually decisive. Stronger than `var(--bg)` (which would blend into the page) and calmer than `var(--accent)` (which would feel like a notification).

### 3. `app/template.tsx`

Next.js `template.tsx` remounts on every navigation (unlike `layout.tsx`), which is exactly what we need for a per-page CSS entrance animation. The wrapper applies a class that triggers a CSS fade-up — except on `/cv` and except on the very first mount (the `Loader` covers first load).

```tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './_template.module.scss';

// Module-scoped, survives template remounts on navigation.
let hasMountedOnce = false;

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isFirstMount] = useState(!hasMountedOnce);

  useEffect(() => {
    hasMountedOnce = true;
  }, []);

  const isStatic = pathname === '/cv';
  const shouldEnter = !isFirstMount && !isStatic;

  return <div className={shouldEnter ? styles.enter : styles.static}>{children}</div>;
}
```

### 4. `app/_template.module.scss`

```scss
.static {
  // No animation. Page just appears.
}

.enter {
  animation: page-enter 0.7s ease-out 0.35s backwards;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .enter {
    animation: none;
  }
}
```

The `animation-delay: 0.35s` matches the `PageTransition` panel cover duration, so the page fades up as the panel reveals it. `animation-fill-mode: backwards` keeps the page invisible during the delay (so the user doesn't see the page flash up before fade-in).

---

## Files to modify

### 5. `app/layout.tsx`

Add `PageTransition` next to `Loader`. Keep `Loader` for the first-load wordmark splash. (The `<main>` element stays in the layout; the per-page wrapper from `template.tsx` will live inside it.)

```tsx
// inside <body>
<Loader />
<PageTransition />
<a href="#main-content" className="skip-link">Skip to main content</a>
<CustomCursor />
<Nav />
<main id="main-content">{children}</main>
```

Add the import:

```tsx
import { PageTransition } from './_components/PageTransition/PageTransition';
```

### 6. `app/_components/Loader/Loader.tsx`

Remove the `routeBarRef` declaration, the `routeBar` div in JSX, and the entire second `useEffect` that listens to `pathname` for the route-bar animation (lines 19, 17 ref decl, 77-96 effect, 100 element). Also remove the `usePathname` import since it'll no longer be used.

The first-load splash logic stays exactly as-is.

### 7. `app/_components/Loader/_Loader.module.scss`

Remove the `.routeBar` rule block (lines 59-68).

### 8. `app/_components/PageIntro/PageIntro.tsx`

Convert to a client component. Animate on mount:

- **Label** — fade in (`opacity 0 → 1`) with a small upward translate.
- **Title** — wrap in an `overflow: hidden` clip; inner span animates `yPercent 110 → 0` for a single-line slide-up reveal. (Per-line stagger would require restructuring `titleNodes`, which is shared across 5 call sites. Single-block reveal is the right cost/benefit here — the Hero on home keeps its existing per-line stagger.)
- **Sub** — fade in after the title.

```tsx
'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import styles from './_PageIntro.module.scss';

type Props = {
  label: string;
  title?: string;
  titleNodes?: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
};

export function PageIntro({ label, title, titleNodes, sub, className }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleInnerRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'expo.out' },
          delay: 0.35, // matches PageTransition cover + page-enter delay
        });
        tl.from(labelRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0);
        tl.from(titleInnerRef.current, { yPercent: 110, duration: 1.0 }, 0.1);
        if (subRef.current) {
          tl.from(subRef.current, { opacity: 0, y: 8, duration: 0.55 }, 0.5);
        }
      });
    },
    { scope: headerRef },
  );

  return (
    <header ref={headerRef} className={['page-intro', className].filter(Boolean).join(' ')}>
      <span ref={labelRef} className="page-intro__label">
        {label}
      </span>
      <h1 className={`page-intro__title ${styles.titleClip}`}>
        <span ref={titleInnerRef} className={styles.titleInner}>
          {titleNodes ?? title}
        </span>
      </h1>
      {sub && (
        <p ref={subRef} className="page-intro__sub">
          {sub}
        </p>
      )}
    </header>
  );
}
```

### 9. `app/_components/PageIntro/_PageIntro.module.scss` (new)

```scss
.titleClip {
  display: block;
  overflow: hidden;
  // Add a little vertical padding so descenders + accents aren't visually clipped on the
  // resting state. The reveal animation slides up from below this padded box.
  padding-bottom: 0.1em;
  padding-top: 0.05em;
  margin-top: -0.05em;
  margin-bottom: -0.1em;
}

.titleInner {
  display: inline-block;
  // Preserve inherited typographic styling for the `<br />` + accent spans inside.
}
```

**Padding/margin trick** — `overflow: hidden` would otherwise clip the bottoms of descenders ("g", "j", "y") and the visual ascenders on uppercase. The negative margins cancel the visual layout impact of the padding so the title still sits where it did.

### 10. (no changes) `app/_styles/globals.scss`

The existing `.page-intro` global rules continue to apply. We're adding an inner clip wrapper without changing the outer block.

---

## What about case-study pages?

`CaseHero` is _not_ `PageIntro` — it has its own structure (breadcrumb + multi-line `<h1>` with per-line styling for accent/outline). Two options:

- **A — Animate `CaseHero` separately** with the same yPercent reveal pattern. Adds a useGSAP, a clip wrapper around the title, and a separate fade-in for breadcrumb + summary.
- **B — Rely on the template-level `page-enter` fade-up only** for case studies. No per-line title reveal there; just the page-wrapper fade-up.

**Decision: B for this spec.** `CaseHero` is already a strong, content-dense visual block — the template fade-up gives it a clean entrance without competing with the existing hero typography. If a richer per-line reveal is wanted on cases later, it's a follow-on (logged to `futureWorks.md`).

---

## Animation timing — full sequence on a route change

```
t=0.00   user clicks a link
         pathname changes; both PageTransition and template effects fire
t=0.00   PageTransition: panel slides up from below (0.35s, expo.inOut)
         template: page-enter is queued but waiting on animation-delay
t=0.35   panel fully covers screen
t=0.40   panel begins sliding up out of viewport (0.4s, expo.inOut, +0.05 lead-in)
t=0.35   page-enter begins (opacity 0→1, y 8→0, 0.7s ease-out)
t=0.80   panel completely off-screen; page is fully visible
t=1.05   page-enter completes
t=0.70   PageIntro animation begins (delay 0.35 matches)
t=~1.70  PageIntro title fully revealed
```

Total perceived nav cost: ~0.8s before content is visible, ~1.7s before the title reveal finishes. Body overflow is locked for ~0.8s (panel cover phase) to prevent scroll jumps mid-transition.

---

## Reduced motion

All three pieces respect `prefers-reduced-motion: reduce`:

- `PageTransition` — early-returns before the timeline starts. New page just appears; body overflow is never locked.
- `template.tsx` page-enter — `@media (prefers-reduced-motion: reduce) { .enter { animation: none; } }`.
- `PageIntro` — the `gsap.matchMedia` block for reduced motion is omitted (no animation runs); elements are visible at their natural CSS state by default (no `gsap.set` opacity/transform applied).

---

## /cv handling

Three guards:

1. **`PageTransition`** — skips when `pathname === '/cv'` OR previous pathname was `/cv`. So navigating to/from /cv has no panel.
2. **`template.tsx`** — when `pathname === '/cv'`, applies `.static` class with no `animation` rule. Page is static.
3. **`PageIntro`** — not used on `/cv` at all (the `CvPage` doesn't render `PageIntro`). No change needed.

Also: `@media print { .panel { display: none !important; } }` on the `PageTransition` panel as a final safety net — if somehow it's mid-animation when a print is triggered, it won't appear in the printout.

---

## Edge cases

- **Back/forward browser nav** — `usePathname()` fires on these too. Panel and page-enter run normally. Acceptable; same UX as forward nav.
- **Hash-only navigation** (e.g. `/about#contact`) — `usePathname()` does NOT change when only the hash changes. No transition fires. Good — we don't want a panel for in-page anchors.
- **Repeated rapid clicks** — `useEffect` for pathname will fire once per pathname change. GSAP timelines run on the same panel; if a new transition starts mid-animation, GSAP will overwrite. Body overflow could get stuck if two timelines race. Mitigation: kill any in-flight tween before starting a new one with `gsap.killTweensOf(panel)` and reset `document.body.style.overflow` in the new effect's prologue.
- **First load on a non-root path** (e.g. user lands directly on `/work`) — `Loader` splash plays as the page mounts. `template.tsx` first-mount detection skips the page-enter. `PageIntro` animation still runs (it's not gated by first-mount), which is what we want — it should animate in even on a fresh land. PageIntro starts at `delay: 0.35`, so it begins while the splash is still finishing its progress fill — visually consistent.
- **Loader still locks body overflow on first load.** We don't double-lock during nav — `PageTransition` only locks during its own timeline.
- **Reduced motion AND nav to /cv** — both early-return paths are independent. No interaction.

---

## Files touched (final list)

**Created (5):**

- `app/template.tsx`
- `app/_template.module.scss`
- `app/_components/PageTransition/PageTransition.tsx`
- `app/_components/PageTransition/_PageTransition.module.scss`
- `app/_components/PageIntro/_PageIntro.module.scss`

**Modified (4):**

- `app/layout.tsx` — import + render `PageTransition`
- `app/_components/Loader/Loader.tsx` — remove routeBar logic
- `app/_components/Loader/_Loader.module.scss` — remove routeBar styles
- `app/_components/PageIntro/PageIntro.tsx` — convert to client, add animation

**Unchanged (intentional):**

- All home components (Hero stays as the bespoke home entrance).
- `Reveal` component (still handles scroll-triggered reveals below the fold).
- `CaseHero` (relies on template fade-up only; richer treatment deferred).
- `/cv` page and its components.

---

## Commit plan

One commit per logical unit on `feature/page-transitions`:

1. `feat: add PageTransition sliding panel component`
2. `feat: add template.tsx page-enter wrapper`
3. `feat: animate PageIntro title and label on mount`
4. `refactor: remove route bar from Loader (replaced by PageTransition)`
5. `feat: wire PageTransition into root layout`

(If multiple files for one logical unit are touched in the same commit, they stay together.)

---

## Verification checklist

Before opening the PR:

- [ ] `npm run build` clean
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run dev` — navigate every route and visually confirm:
  - [ ] `/` — hero animation still plays as before (unchanged); navigating away triggers panel.
  - [ ] `/about` — panel sweep, then PageIntro reveals.
  - [ ] `/contact` — same.
  - [ ] `/work` — same.
  - [ ] `/work/avsb` — panel sweep, then CaseHero appears with fade-up (no per-line reveal).
  - [ ] `/cv` — no panel, no entrance, static landing. Print preview clean.
  - [ ] Navigating /about → /cv → /about — no panel either direction.
  - [ ] Back/forward — panel plays.
- [ ] System reduced-motion toggle ON (macOS: Accessibility → Display → Reduce motion) — confirm all pages just appear, no panel, no fade.
- [ ] Hash navigation (e.g. clicking an in-page anchor) — confirm no panel triggers.
- [ ] Tab focus into a new page — first focusable element receives focus appropriately.
