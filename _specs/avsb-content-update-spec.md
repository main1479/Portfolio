# AvsB content update — technical spec

## Files touched

1. `app/_lib/work-projects.ts` — AvsB entry (slug `'avsb'`, `num: '01'`).
2. `app/work/avsb/content.mdx` — frontmatter + body sections.

No other files change. The page shell (`app/work/avsb/page.tsx`), OG/Twitter image routes (`opengraph-image.tsx`, `twitter-image.tsx`), and the shared case components are all data-driven from `frontmatter`.

---

## 1. `app/_lib/work-projects.ts`

Current AvsB entry:

```ts
{
  slug: 'avsb',
  num: '01',
  title: 'AvsB',
  summary: 'An in-house, CLI-driven A/B testing platform — built from scratch.',
  metaShort: 'CLI-driven experimentation platform built from scratch.',
  tags: ['Next.js', 'TypeScript', 'ClickHouse', 'Product'],
  categories: ['product', 'experimentation'],
  featured: true,
  order: 1,
  year: '2025 – Present',
  type: 'own',
  yearStatus: '2025 · Building',
  hasCase: true,
  href: '/work/avsb',
},
```

New entry:

```ts
{
  slug: 'avsb',
  num: '01',
  title: 'AvsB',
  summary:
    'A full-stack A/B testing & feature-flag platform — visual editor, statistics engine, edge ingestion, SDKs, built solo.',
  metaShort: 'Full-stack experimentation & feature-flag platform built solo.',
  tags: ['Next.js 16', 'TypeScript', 'ClickHouse', 'Cloudflare Workers', 'Statistics'],
  categories: ['product', 'experimentation'],
  featured: true,
  order: 1,
  year: '2026',
  type: 'own',
  yearStatus: '2026 · Pre-launch',
  hasCase: true,
  href: '/work/avsb',
},
```

### Why these specific changes

- **`summary`** — used on `/work` IndexRow as the prose blurb. Broadened to name the three pillars (testing, flags, edge) without going long.
- **`metaShort`** — used on home `SelectedWork`. Tightened to one line that still says "more than a CLI".
- **`tags`** — five tags (IndexRow caps display at 3 via `slice(0, 3)`, so the extras are safe). Ordered most-recognizable first: framework, language, analytics store, edge runtime, the technical centerpiece.
- **`year`** — actual build window is Mar–May 2026, ~10 weeks. `'2025 – Present'` was carried over from boilerplate.
- **`yearStatus`** — `'2026 · Pre-launch'` reads honestly. "Building" is fine for Kemon Doctor (still being assembled); AvsB is feature-complete but unshipped — pre-launch is more accurate.

### Tags must satisfy `WorkProject['tags']`

Tags type is `readonly string[]` per `app/_types/work.ts`. No enum constraint — any string is fine. No need to touch the type file.

---

## 2. `app/work/avsb/content.mdx`

### Frontmatter changes

```ts
export const frontmatter = {
  slug: 'avsb',
  num: '01',
  title: 'AvsB',
  pageTitle: 'AvsB — A/B Testing & Feature-Flag Platform · Mainul Islam',
  pageDescription:
    'A full-stack A/B testing and feature-flag platform with a serious statistics engine, edge ingestion, and a full SDK family — built solo over ~10 weeks.',
  heroLines: [
    { text: 'AvsB', style: 'plain', trailingAccentDot: true },
    { text: 'Experiments,', style: 'outline' },
    { text: 'end to end.', style: 'plain' },
  ],
  summary:
    'A full-stack A/B testing and feature-flag platform — the kind of product companies usually license from Optimizely, LaunchDarkly, or Statsig. Built solo with a serious statistics engine, edge ingestion, and a full SDK family.',
  meta: [
    { label: 'Role', value: 'Sole\ndeveloper' },
    { label: 'Type', value: 'Own\nproduct' },
    { label: 'Year', value: '2026' },
    { label: 'Status', value: 'Pre-launch', accentDot: true },
  ],
  next: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
  footerHeading: 'Got something to test?',
};
```

Notes:

- `pageTitle` updated for SEO/share previews.
- `pageDescription` is also the meta description.
- `heroLines` — kept the three-line shape; changed "in code." → "end to end." to reflect scope.
- `meta` — Year is single value (no range); Status reads "Pre-launch" with the accent dot.

### Body sections — rewrite

The six existing `<CaseBlock>` sections + the `<CaseVisuals>` block stay structurally. Content per block:

#### 01 · Overview · "What it is"

A vs B is a full-stack A/B testing and feature-flag platform — the kind of product companies usually license from Optimizely, LaunchDarkly, GrowthBook, or Statsig. It covers the full loop: build experiments in a visual or code editor, ship them through a zero-dependency snippet, ingest events at the edge into a columnar analytics store, and read back statistically rigorous results across **three different inference engines** (frequentist, Bayesian, and sequential / always-valid).

#### 02 · My role · "What I did"

**Sole developer.** Designed and built the platform end to end — architecture, data modelling, the statistics engine, the edge ingestion path, the visual + code editors, the SDK family, the dashboards, and the org/RBAC/billing layer. ~10 weeks, March–May 2026.

#### 03 · The problem · "What it solves"

Experimentation platforms have to be three things at once: a comfortable surface for the people who run tests, a fast/cheap analytics pipeline, and a statistically defensible analysis layer. Most commercial tools nail one and compromise on the others. AvsB is an attempt to take all three seriously in a single, coherent codebase — without giving up the developer ergonomics of code-first workflows.

#### 04 · What I built · "The approach"

- **Experiment builder** — six-step flow (targeting → variations → metrics → analysis → review → history), with autosave, draft history, and a real visual editor (confidence-tiered selector engine, viewport targeting, multi-user presence and edit-locking, persisted accessibility findings).
- **Feature flags** — typed flags (boolean/string/number/JSON), per-environment configurations, ordered targeting rules, A/B-test rules that reuse the same statistics engine.
- **Statistics engine** — frequentist (Welch's z), Bayesian (Beta-Binomial + Monte Carlo), and sequential / always-valid (Asymptotic Confidence Sequences) run side by side. CUPED variance reduction with an auto-gate, BCa bootstrap for quantiles, delta method for ratios, SRM detection, multiple-comparison corrections.
- **Edge ingestion** — five Cloudflare Workers (with Durable Objects) for ingestion, real-time pub/sub, SSE streaming, R2-backed CDN, and cron — all in front of a ClickHouse analytics store with exposure-attributed queries.
- **SDK family** — browser snippet, JS/Node/React SDKs, a CLI, and a browser extension.
- **The org/RBAC layer** — orgs, projects, members, 5 built-in roles + custom roles with 10 granular permissions, invitations, audit log, billing.

#### 05 · Stack · "Tools used"

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Prisma 7 + PostgreSQL (Neon)
- ClickHouse for analytics
- Redux Toolkit, Zod, NextAuth v5
- Cloudflare Workers + Durable Objects, R2
- SCSS Modules (Dart Sass)
- Vitest, Playwright, MSW, Testcontainers
- Sentry, Pino, Resend, Anthropic SDK

#### 06 · Outcome · "By the numbers"

- ~370,000 lines of TypeScript / SCSS
- 250 API routes · 71 Prisma models · 26 migrations
- 29 Redux slices · ~140 documentation pages
- 867 test files · ~8,000 test cases
- 5 Cloudflare Workers · 4 published SDK packages
- ~2,000 commits · 215 plans + 237 specs written

Solo build, ~10 weeks (Mar–May 2026). Currently pre-launch — no external users yet — while the public API and pricing stabilise.

### Keep as-is

- The `<CaseVisuals>` block with the `<CodeMock>` and the placeholder "Dashboard · in-progress" item. The CLI mock is still an honest illustration of the CLI surface. The placeholder is tracked in `futureWorks.md` for a real dashboard screenshot.
- Captions can stay: "CLI example · ship a test in 3 commands" / "Dashboard · in-progress".

---

## Edge cases

- **MDX type-check** — `frontmatter` is consumed in `page.tsx` for `metadata` and by `CaseLayout` for the meta sidebar. Field shapes match the existing type; no widening.
- **OG / Twitter images** read from frontmatter — automatically pick up new title/description on next build.
- **`pageDescription` length** — ~190 chars; safely under the 200ish cap most social cards use.
- **`heroLines` shape** — `trailingAccentDot` only on line 1, `outline` style on line 2 — matches the established pattern across other case pages (verify against `kemon-doctor`, `radius`).
- **Tags overflow on home `<WorkRow>`** — already capped at 3 (`project.tags.slice(0, 3)` in WorkRow.tsx and IndexRow.tsx).
- **Type fit** — `tags` is `readonly string[]`; no need to extend the literal union. `yearStatus` is `string | undefined`.

## Verification

1. `npx tsc --noEmit` — clean.
2. `npm run lint` — clean.
3. `npm run build` — clean. Verify `/work/avsb` static-generates with the new metadata.
4. Manual: `npm run dev`, hit `/` (Selected Work strip), `/work` (IndexRow), `/work/avsb` (full case). Check meta sidebar, hero lines, all six blocks, both visuals.
5. View source on `/work/avsb` — confirm `<title>` and `<meta name="description">` reflect the new copy.

## Out of scope (logged to futureWorks if not already)

- Real dashboard screenshots (already logged).
- Updating the home page hero or any non-AvsB case copy.
- Adjusting tags/categories of other projects to align styling.

## Retrospective

The first pass took the source doc's "Build timeframe ~10 weeks (Mar–May 2026)" at face value. The actual project history is **1.5+ years**: a couple of earlier versions were scrapped due to early architectural decisions that didn't scale, and the current iteration spent its full first year on foundation work before any of the visible platform existed. Claude Code was a co-engineer throughout — surfaced as a single light-touch phrase in Block 02.

Corrections applied in a follow-up commit on the same branch:

- `work-projects.ts` AvsB entry: `year` `'2026'` → `'2024 – Present'`; `yearStatus` `'2026 · Pre-launch'` → `'2024 · Pre-launch'`.
- `content.mdx` frontmatter: `pageDescription` "~10 weeks" → "1.5+ years"; meta sidebar Year `'2026'` → `'2024 –\nPresent'`.
- `content.mdx` Block 02: rewritten to include the 1.5+ years, scrapped-versions history, foundation-year framing, and the Claude Code mention.
- `content.mdx` Block 06: dropped the "~10 weeks (Mar–May 2026)" line; replaced with a one-line 1.5+ years note (full narrative lives in Block 02 to avoid duplication).

Lesson: when a source doc states a timeline, treat it as a number to verify with the user before publishing, not a fact to copy through. Especially for time-on-project, which is almost always undercounted by snapshot tooling.
