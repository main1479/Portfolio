# Skew scrolling — combined plan/spec note

**Date:** 2026-06-11 · **Branch:** `feature/awwwards-motion` · trivial single-concern change, combined note per CLAUDE.md.

**What:** The whole page leans with scroll velocity — scroll fast and content skews up to ~2.5°, stop and it eases back upright. The signature "the page has physics" feel.

**How:** In `SmoothScroll` (same matchMedia context as the smoother — desktop fine-pointer, no reduced motion): a `ScrollTrigger.create({ onUpdate })` maps `getVelocity()` to a clamped skewY on `<main id="main-content">` via `quickSetter`, with a `gsap.to` decay back to 0 (GSAP's documented velocity-skew pattern). Skew goes on `<main>` (child of the smoother's content) because ScrollSmoother owns the content element's transform; nav/cursor/portals live outside `<main>` and stay straight.

**Risks:** text shimmers slightly during fast scroll (inherent to the effect); skew is ~0 whenever ScrollTrigger refreshes (decay is fast), so pin measurements are unaffected. Reverting = deleting one block.
