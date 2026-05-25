# Responsive issues fix — plan

A pass over the live site to clean up layout issues that show up at the 1300–900px band (a sort of "no-man's land" between wide desktop and the tablet breakpoint), tighten the Contact page so the form actually reads as a form, and polish a few spacing oversights on About, Contact, and the Footer. All visual, no functional changes.

---

## Why now

The site looks tidy at ≥1500px and ≤900px (the two breakpoints it was designed against), but the band in between currently shows a handful of "almost broken" moments — text crowding, overlapping rows, headers running flush to the viewport edge. None of these block the launch, but each one undermines the polish the rest of the site has earned. Fixing them is mostly small SCSS work.

## Scope — the nine things

1. **Home — Selected Work + What I Do (1300–900px)** — sections look squeezed in this band. Tune column widths / type so they sit calmly until the tablet rule at 900px kicks in.

2. **/work index — overlap from 1500–900px** — work rows start to overlap each other around 1500px and stay broken until the 900px tablet breakpoint. Add an intermediate column rule (already exists at 1100px — extend higher) so the layout doesn't break.

3. **About + Contact — page-intro header has no side spacing** — the giant page-intro title currently sits flush to the viewport edge on these two pages because it isn't wrapped in `<Container>` (Work _is_ wrapped). Wrap them.

4. **About bio — text too big on mobile** — drop the bio paragraph font-size to `clamp(1.2rem, 2.5vw, 2.6rem)` (user-tested).

5. **About bio cards — don't scale on tablet/mobile** — cards under the avatar use a fixed `2.6rem` value. Convert to a fluid clamp so they shrink on tablet and mobile.

6. **About — "Where I have worked" (Experience) section (1300–900px)** — role titles read too large in this band. Tune the clamp/middle term down.

7. **Contact — stack form + direct line vertically** — they're side-by-side today. Stack them at all viewport widths (direct line goes below the form) so they're easier to scan.

8. **Contact — form doesn't feel like a form** — fields are underlined-input style with no visible "box" cue. Give the inputs a subtle background fill + clearer border-bottom so users know where to click and type.

9. **Contact — add a subtitle near the form header** — small label like _"If a form isn't your thing — message me directly below."_ The aside copy already says this, but with the new stacked layout the user needs a verbal nudge that the direct contact info lives below.

10. **Footer — tune 1500–900px + add top spacing on the "Mainul" mark** — the big stroked name has no breathing room above it; add `margin-top`. And the rest of the footer's columns get a touch crowded in this band.

> Numbered 1–10 for clarity even though the brief mentioned nine — the form-stacking and "doesn't look like a form" notes are split into two distinct work items.

## What this is not

- **Not a redesign.** The visual language stays the same — only spacing/sizing values move.
- **No new components.** Editing existing modules and the page-intro global.
- **No content changes** other than the new short subtitle on the Contact form.
- **No behavior changes** — form submission, links, animations, focus states all stay.

## Branches and process

Branch already exists: `fix/responsive-issues`. Single PR back to `main` at the end. Each numbered fix gets its own commit so the diff history reads cleanly. Verified with `/ship` and a manual visual pass across the affected breakpoints (320, 380, 640, 768, 900, 1100, 1300, 1500, 1640) before opening the PR.
