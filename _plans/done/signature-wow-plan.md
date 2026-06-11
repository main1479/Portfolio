# Signature wow pass — plan

**Date:** 2026-06-11
**Branch:** `feature/awwwards-motion` (continues PR #25)
**Trigger:** Feedback on the first motion pass — "still very very basic, no wow factor, user wouldn't feel anything unique."

## The diagnosis

The first pass added polish: smooth scrolling, text that rises out of masks, hover flips. Those are _table stakes_ — every good studio site has them, so a visitor feels "tidy," not "whoa." Wow comes from two things the site doesn't have yet:

1. **A signature idea** — one thing a visitor has never seen on any other portfolio.
2. **Set pieces** — a few moments that physically change how the page behaves, not just how it decorates itself.

We already own a unique idea and we're wasting it: the hero has a Variant A/B toggle, because Mainul's whole job is A/B testing. Right now it's a quiet little switch. This pass makes the _entire visit_ feel like being inside a live experiment.

## What gets built (five pieces)

### 1. The assignment ceremony (first impression)

The loading screen becomes a tiny experiment ritual: a percentage counts up in data-style type while status lines tick through ("calibrating… bucketing visitor…"), and it stamps **"You're in Variant B"** before lifting away. The hero then _opens in the variant you were assigned_ — randomly, like a real A/B test. Each new visit can land you in the other variant. No other portfolio does this; it's the developer's actual craft turned into the front door.

### 2. The work gallery becomes a set piece (home page)

The Selected Work list on the home page is replaced by a cinematic gallery: the page locks in place and the projects glide **sideways** as you scroll — huge screenshots, oversized numbering, a live "02 / 05" progress readout. This is the structural "the site just changed how it moves" moment. On phones and for reduced-motion users it's a normal vertical stack.

### 3. Liquid hover previews (/work index)

The floating image that follows your cursor over the work list moves to the /work index (the home list it served is now the gallery) and gets rebuilt with real-time graphics: the screenshot **ripples and color-splits with the speed of your hand**, and melts from one project to the next instead of crossfading. This is the classic "expensive site" feel — done with the browser's built-in graphics API, zero new packages.

### 4. The lights go down (every page's ending)

As you reach the closing call-to-action, the entire site inverts — warm paper smoothly becomes near-black ink, text flips to light — driven by your scroll, so you feel like you're scrolling into night. Scroll back up and it reverses. A page-level transformation visitors _feel_.

### 5. Micro-feel kit (everywhere)

- Buttons subtly **pull toward your cursor** before you reach them (magnetic).
- The little data labels **descramble into place** like a terminal decoding.
- The big stats **count up** when they enter view.

## What this is not

- No new npm packages. Everything uses GSAP plugins already installed (now free) plus the browser's own WebGL.
- Nothing breaks for keyboards, screen readers, phones, or reduced-motion users — every piece has a calm fallback that matches today's behavior.

## Risks, named honestly

- The horizontal gallery is the biggest layout change since the home page shipped; it's also the most likely to need feel-tuning on a real trackpad.
- The dark inversion touches every color on the page; contrast is checked in both states.
- WebGL preview falls back to the current crossfade version if the graphics context can't start (old GPU, blocked canvas).
