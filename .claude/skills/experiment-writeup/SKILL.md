---
name: experiment-writeup
description: Draft a portfolio case study for an A/B test or experimentation project. Use when the user wants to turn a hypothesis + variants + results into a case-study draft, or asks for "case study help", "experiment writeup", "how should I write up this test", "draft a /work entry". Produces a structured draft the user can edit, not a final published page.
---

# experiment-writeup

This portfolio sells the user's specialty — A/B testing and experimentation — so case studies are the most important content on the site. Each one needs to do three things:

1. Show a clear hypothesis and how it was tested.
2. Show the outcome honestly (including null results).
3. Show what the author learned and would do differently.

This skill turns raw notes into that structure.

## What to collect (ask if missing)

Before drafting, confirm the user has:

- **Context** — what product/page, what audience, what timeframe.
- **Hypothesis** — "If we change X, then metric Y will move because Z."
- **Variants** — control + 1 or more treatments. Brief description, not full mock.
- **Primary metric** — the one number that decided the test.
- **Guardrail metrics** — what couldn't be allowed to regress.
- **Sample size / duration** — how long it ran, how many users.
- **Result** — winner/null/loser, effect size, statistical confidence if known.
- **What they learned** — one or two sentences. This is often the most valuable part.

If any of these are missing, ask before drafting. Don't fabricate numbers.

## Structure of the draft

The draft should follow this skeleton — adapt headings to fit but keep the order:

```
# <Short, specific title — not "Checkout Test"; "Reduced cart abandonment with a single-page checkout">

## The problem
2–3 sentences. What was happening, why it mattered.
Include the metric baseline.

## The hypothesis
One sentence in If/Then/Because form.

## What we tested
Variant breakdown. Screenshot or short description of each.
Note primary + guardrail metrics. Sample size and duration.

## What happened
The result. Effect size, confidence interval if known.
Include guardrail movement, even if the primary metric won.
If the test was null or lost, say so plainly — null results are a feature, not a bug.

## What I'd do differently
Honest reflection. What we'd test next, what we'd instrument better, what
this taught us about the user.

## My role
1–2 sentences. What the author specifically did — design, instrumentation,
analysis, decision. Distinguish from team contributions.
```

## Tone

- **Past tense, first-person plural for team work; first-person singular for the "My role" section.**
- **Specific numbers, not approximations.** "Cut bounce from 47% to 33%" beats "improved bounce significantly".
- **Show the math.** If a test was significant at p < 0.05 with a 4.1% lift, say so. Reviewers in the industry will read for this.
- **No marketing language.** This is a technical readership.
- **Honest about limitations.** Sample size, confounders, segments not covered.

## What to do

1. Confirm you have all eight items above. If not, ask.
2. Draft the case study following the skeleton.
3. After the draft, include a `## Reviewer flags` section with anything the author should double-check before publishing — claims that need a source, numbers that look surprising, gaps in the data.
4. If the user wants a shorter "card" version (for the /work index), produce a 2-sentence summary: outcome + one-line how.

## What not to do

- Don't invent numbers. If a value is missing, mark it `[TODO: insert <metric>]`.
- Don't overclaim. If the test was inconclusive, write it as inconclusive.
- Don't write in jargon-only. The case study should be readable by a thoughtful PM who isn't a statistician.
- Don't end with "I'm passionate about experimentation." Show it, don't claim it.

## Format

After the draft, include:

```
## Reviewer flags

- <anything to double-check>

## Card summary (for /work index)

<two-sentence summary, outcome first>
```
