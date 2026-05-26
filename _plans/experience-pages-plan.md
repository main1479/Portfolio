# Experience detail pages — `/experience/[slug]`

## Why

The `/work/client` case study currently mixes two things: A/B testing work I've done as a Conversion.com agency contractor (real agency clients — The Times, G-Star RAW, Motorway, Unity, etc.) and personal freelance frontend work (the "nine countries" list — UK, India, Slovakia, etc.). They're not the same engagements and shouldn't share a page. Worse, the homepage Experience block at the bottom of `/` shows two roles (Conversion.com 2022–Present and Freelance 2019–Present) as static rows — they look clickable but go nowhere.

This feature kills the muddled case study and replaces it with two dedicated experience pages, one per role, reachable from the homepage Experience block.

## What it is

Two new pages under a new `/experience/<slug>` route:

- **`/experience/client`** — the personal/freelance frontend tenure since 2019. The "nine countries, and counting" story lives here. Stack, approach, named personal clients (Cursimax, Flatwhite, Lenoir, ScalingLab, Azzeroco, etc.).
- **`/experience/gain-conversion`** — the Conversion.com agency tenure since 2022. The "4+ years of A/B tests, 500+ shipped" story lives here. Platforms, named agency clients where permitted, the way I approach test builds.

Each page reuses the existing case-study visual treatment so they feel of a piece with the rest of the site, but the content is honest about which timeline and which clients each role represents.

## What changes elsewhere

- **`/work` index** — the "Client Work" entry (item 04) is removed. Remaining items renumber so the index stays 01–05 with no gap.
- **`/work/client`** — route and content file deleted entirely.
- **Homepage Experience block** — both rows become clickable links to the matching experience page. Visual treatment stays the same; the row becomes an anchor.
- **Sitemap** — `/work/client` entry removed; `/experience/client` and `/experience/gain-conversion` added.

## Content — `/experience/client` (freelance)

- **Title** — Freelance Frontend, since 2019
- **Hero lines** — three-line headline in the existing case-study style.
- **Meta** — Role · Type · Span (`2019 – Present`) · Reach (`9 countries + counting`).
- **Sections**:
  1. **What it is** — freelance frontend builds for startups, founders, and small teams across nine-plus countries. Pure frontend work — no A/B testing claims here.
  2. **Where** — the nine-country list (UK, India, Slovakia, Austria, Australia, Canada, Romania, Italy, Mexico) with the existing `Countries` component.
  3. **Named projects** — Cursimax, Flatwhite, Lenoir App, ScalingLab, Azzeroco, with one-line descriptions. Links to existing case studies where they exist (`/work/cursimax`, `/work/flatwhite`).
  4. **Approach** — translating Figma/XD to production code, mobile-first, accessibility, performance-conscious.
  5. **Stack** — HTML, SCSS, JavaScript, TypeScript, React, Next.js.
  6. **A note** — clients who'd rather not be named, paperwork lost, etc.

## Content — `/experience/gain-conversion` (Conversion.com)

- **Title** — Frontend A/B Testing, at Conversion.com
- **Hero lines** — three-line headline in case-study style.
- **Meta** — Role · Org · Span (`2022 – Present`) · Reach (`500+ tests shipped`).
- **Sections**:
  1. **What it is** — a long-running contract with Conversion.com, building production A/B tests on enterprise experimentation platforms for agency clients.
  2. **Platforms** — Optimizely, Kameleoon, Qubit, AB Tasty, VWO, Adobe Target, Google Optimize.
  3. **Clients I've shipped tests for** — the eight named agency clients from the homepage Selected Clients block (The Times, G-Star RAW, Motorway, Unity, Ironmongery Direct, WaterAid, AdBlock, Deel) plus the "many, many more" line.
  4. **My role** — frontend developer on test programs, direct client access, ownership end-to-end.
  5. **Approach** — resilient selectors, performance budget, QA across breakpoints, clean rollbacks. (Salvaged from the deleted client case study; it was good content in the wrong place.)
  6. **Stack** — JavaScript, TypeScript, SCSS, the testing platforms.

## Design

- Visual treatment matches the existing `/work/<slug>` case-study pages (same `CaseLayout`, `CaseBlock`, `Countries`, hero variants, meta strip).
- Homepage Experience rows become whole-row anchors with the same hover/focus state used elsewhere on the site (subtle background or rule shift on hover; clear focus ring for keyboard).
- No new components unless one specifically simplifies the work (e.g. a tiny `ExperienceClientsList` if the agency-clients block doesn't fit any existing pattern).

## What I'm NOT doing

- Not adding `/experience` to the top nav. The route is reachable from the homepage Experience block; cluttering nav for two pages isn't worth it.
- Not building an `/experience` index page. Two pages don't need an index.
- Not migrating the CV (`/cv`) or About page to link to these experience pages — that's a separate cleanup once these settle.
- Not redesigning the homepage Experience block — just making the existing rows clickable.
- Not changing case-study content (`/work/avsb`, `/work/kemon-doctor`, `/work/radius`, `/work/cursimax`, `/work/flatwhite`) beyond renumbering them.
- Not adding OG/twitter images for the new pages in this PR — comes after the page content is finalised (follow-up commit on the same branch is fine).

## Branch + workflow

Fresh branch: `feature/experience-pages`, cut from `main` (PR #21 with the copy-tweaks is still in flight; I'll rebase this branch after that merges).

Standard plan → spec → implement. Spec lands next once this plan is approved.

## Open questions

- The exact wording of the new pages' headlines and hero lines — I'll draft them in the spec; sign-off there.
- Whether Radius (currently `/work/radius`) should be cross-referenced from `/experience/gain-conversion` as "the internal tool I built for them" — I think yes, but flagging.
- Whether to keep the homepage's Selected Clients block as-is, or fold it into the new gain-conversion page. Recommendation: keep both — Selected Clients on the homepage is a different rhetorical job (scannable proof) than the experience page (depth).
