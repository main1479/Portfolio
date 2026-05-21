---
name: polish-copy
description: Tighten portfolio copy — hero text, case study summaries, project descriptions, about-page bios. Use when the user asks to "polish", "tighten", "edit", "shorten", or "make this read better"; or when they paste a paragraph of marketing/portfolio copy and ask for feedback. Removes filler, sharpens verbs, and matches the portfolio's voice (calm, specific, evidence-led).
---

# polish-copy

A small editor for the copy that lives on this portfolio. Default scope is short-form: hero copy, case-study TL;DRs, work-card descriptions, about-page bios, contact-page intros. For long-form (full case-study writeups), use the `experiment-writeup` skill instead.

## Voice

This portfolio sounds like its author: a frontend developer who runs experiments. That means:

- **Specific over abstract.** "Cut bounce 14%" beats "improved user engagement".
- **Calm over hype.** No "revolutionary", "game-changing", "world-class".
- **Verbs do the work.** Replace adjective stacks with concrete verbs. "Designed and shipped" beats "innovative, scalable solutions".
- **No marketing hedges.** Drop "kind of", "really", "just", "very", "actually" unless they earn their keep.
- **Numbers earn trust.** Where a number exists, use it.

## What to do

1. Read the copy the user provided. If they didn't paste any, ask them to.
2. Identify the audience and intent (hero → hook + position; case-study summary → outcome + how; bio → who + what + how to reach).
3. Return three things, in order:
   - **Tightened version** — the rewrite. Keep length within ±20% of the original unless the user asked to shorten or expand.
   - **Edits made** — short list of the changes, with a one-line reason each. ("Replaced 'highly skilled' with 'specialises in' — softer, more specific.")
   - **Open questions** — anything you need from the user to push it further. (Missing metric, unclear audience, etc.)
4. If the user asked for variants, offer 2–3 distinct angles with one-line labels (e.g. "outcome-first", "story-first", "credential-first") rather than five near-identical rewrites.

## What not to do

- Don't rewrite into a different voice (witty, snarky, hard-sell) unless the user asks.
- Don't add details that aren't in the source — flag them as "open questions" instead.
- Don't pad short copy. If three words suffice, three words ship.
- Don't lean on "passionate", "driven", "results-oriented". These signal nothing.

## Format

```
## Tightened

<the rewrite>

## Edits

- <change> — <reason>
- ...

## Open questions

- <thing the user needs to confirm or supply>
```

If there are no open questions, drop that section.
