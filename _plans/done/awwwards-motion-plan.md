# Awwwards-level motion & interactions — plan

**Date:** 2026-06-11
**Status:** approved (user: "use your best judgment — only condition is it should look exceptional. Modern, clean, awwards worthy")

> **Revision 2026-06-11:** added Layer 0 (visual content). Repeated user feedback says the
> site lacks visual elements — ~30 project screenshots exist in `public/work/` but are
> invisible until two clicks deep. Visuals are the substrate the motion animates, so they
> go in first.

## Why

The site has a motion base (scroll reveals, ink curtain page transition, magnetic buttons, custom cursor), but it still reads as "tasteful" rather than "alive". Compared to the 2021 portfolio — the one whose motion actually landed the Conversion job — it feels static. The motion _is_ the credential for an A/B-testing frontend developer; this pass closes that gap.

## The big idea

Right now, almost everything animates **once** (fade in when it enters the screen) and then sits still. Award-winning sites feel different because the page _continuously responds_ — to scrolling, to scroll speed, to the cursor. This plan adds that responsiveness in four layers, from foundation to signature moments.

A key unlock: the animation library we already use (GSAP) made its formerly-paid plugins free. So everything below uses **zero new packages**.

## What's being built

### Layer 0 — Visual content (the substrate)

0a. **Work imagery on the surface.** Every project gets a designated cover image, shown on the
home page's Selected Work section and the `/work` index. The strongest content on the site
(real shipped product) becomes visible in the first ten seconds instead of two clicks deep.
0b. **Browser-framed screenshots.** Case-study images get a minimal browser-chrome frame and
per-project background tint, so raw captures read as composed artwork instead of flat pastes.
0c. **Grain + oversized type texture.** A subtle film-grain overlay across the site and
oversized outlined background words on key sections — cheap, and a large share of the
"expensive" feel on awarded sites.

Deferred from Layer 0 (logged to futureWorks): A/B variant-comparison visuals and uplift
charts (needs per-case data design), client logos (needs assets from Mainul), about-page
candid photos (needs photos).

### Layer 1 — Foundation (the "feel")

1. **Buttery smooth scrolling.** The whole page glides instead of jumping with each wheel tick. This single change is the biggest reason award sites feel expensive. (GSAP ScrollSmoother — already in our installed version.)
2. **Letter-and-line text reveals.** Big headings stop fading in as one block. Instead, lines rise out of an invisible mask, letter by letter or line by line. Hero headline, section titles, and case-study titles all get this. (GSAP SplitText — also already installed.)

### Layer 2 — Scroll choreography (the page responds as you move)

3. **Parallax images.** Photos and case-study images drift at a slightly different speed than the page, like looking out a train window. Images also "unveil" — a wipe plus a gentle zoom-out — as they enter.
4. **Scroll-velocity effects.** Scroll fast and the marquee speeds up and skews with you; stop and it settles back. The page feels like it has physics.
5. **Section titles tied to scroll.** Oversized section labels slide horizontally as you scroll through their section — position driven by scroll, not by a one-shot trigger.
6. **Footer reveal.** The end-of-page CTA sits "underneath" the page and is gradually uncovered as you reach the bottom — a classic award-site sign-off.

### Layer 3 — Hover & cursor interactions (the page responds to your hand)

7. **Floating work previews.** On the Selected Work list, an image of each project floats next to the cursor and swaps/tilts as you move between rows. The flagship interaction on most awarded portfolios.
8. **Cursor states with labels.** The custom cursor grows and says "View" over work items, "Open" over links — context-aware instead of just a dot.
9. **Text-roll link hovers.** Nav and footer links flip their letters up (split-flap style) on hover instead of a plain color change.

### Layer 4 — Signature moments

10. **Loader → hero handoff.** The intro loader and the hero entrance become one continuous choreographed sequence instead of two separate animations — the curtain lift literally hands off to the headline rising.
11. **Hero scroll-out.** As you start scrolling, the hero headline subtly scales down and fades behind the incoming content instead of just sliding off.
12. **Nav drawer choreography.** Menu open/close gets a staggered cascade (links rise one by one) instead of a plain slide.

## What stays the same

- The ink-curtain page transition stays (it's good) — it just gets synced with the new text reveals so arriving pages feel composed.
- All existing reduced-motion behaviour stays and extends to every new effect: users who opt out of motion get the calm version of the site, including normal native scrolling.
- No new npm packages. No analytics, no widgets.

## Risks / honesty section

- Smooth scrolling is the one item that can feel _worse_ if done badly (laggy on weak devices, fights with browser back-button position). We'll test it and it's a one-line removal if it doesn't earn its keep.
- This is a big pass. I'll build it in the four layers above, each as its own commit, so we can stop or trim at any layer.

## Effort

One feature branch, roughly 10–14 files touched plus a few new small components. Layers 1–2 are the bulk of the value; 3–4 are the polish that gets remembered.
