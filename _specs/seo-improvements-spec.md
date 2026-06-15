# SEO Improvements — Technical Spec

**Status:** Awaiting approval
**Plan:** `_plans/seo-improvements-plan.md`
**Branch:** `feature/seo-improvements`
**Decisions locked:** Canonical host = **apex `https://mainul.info`** (no code change; flip Vercel redirect). Google Search Console = set up, primary verification via existing GA4 tag, optional meta-tag fallback wired via env.

---

## 1. Canonical / host alignment (P0)

**Finding:** `NEXT_PUBLIC_SITE_URL=https://mainul.info` (apex) and all canonical/sitemap/OG URLs already resolve to apex. The *only* inconsistency is the live Vercel redirect, which currently sends apex → `www`. That contradicts the canonical.

**Code changes:** none required.

**Manual action (you, in Vercel — I'll give exact clicks):**
- Project → Settings → Domains. Make `mainul.info` the primary domain and set `www.mainul.info` to **redirect to** `mainul.info` (reverse of today).
- Net effect: every URL — redirect target, canonical, sitemap, OG — agrees on `https://mainul.info`.

**Verification:** `curl -sI https://www.mainul.info` returns `301` → `https://mainul.info`; `curl -sI https://mainul.info` returns `200`.

---

## 2. Structured data / JSON-LD (P1)

### New file: `app/_components/JsonLd/JsonLd.tsx`
Server component (no `'use client'`). Renders a single `<script type="application/ld+json">`.

- Props: `{ data: Record<string, unknown> }` (loosely typed at the boundary; builders below are strictly typed).
- Serialise with `JSON.stringify(data)` and **XSS-guard** by replacing `<` with `\\u003c` before injecting via `dangerouslySetInnerHTML` (prevents a `</script>` breakout — standard practice).
- Server-rendered so the JSON-LD is in the initial HTML Googlebot receives (not injected post-hydration). Do **not** use `next/script` for this.

### New file: `app/_lib/structured-data.ts`
Pure builder functions returning typed schema objects. All URLs absolute, derived from `siteConfig.siteUrl`. Builders:

- `personSchema()` → `@type: 'Person'`
  - `name`, `jobTitle: 'Frontend Developer'`, `description` (short positioning line), `url: siteUrl`, `image: ${siteUrl}/me.jpg`, `email`.
  - `sameAs`: LinkedIn + GitHub (pulled from `siteConfig.metaLinks`, external only — filter out the mailto/CV).
  - `knowsAbout`: `['A/B testing','Conversion rate optimization','Experimentation','Optimizely','AB Tasty','Kameleoon','VWO','Adobe Target','Qubit','Next.js','React','TypeScript','Frontend development']` — directly serves the discovery-term goal.
- `webSiteSchema()` → `@type: 'WebSite'`, `name`, `url`, `inLanguage: 'en'`, `author: { @type: 'Person', name }`. (No `SearchAction` — there's no site search, and faking one violates Google's guidelines.)
- `breadcrumbSchema(items: {name: string; url: string}[])` → `@type: 'BreadcrumbList'` with positioned `ListItem`s.
- `creativeWorkSchema(project)` → `@type: 'CreativeWork'` per case study: `name` (title), `description` (summary), `url` (absolute href), `image` (absolute cover), `creator: Person`, `keywords` (tags), `dateCreated`/`temporalCoverage` from `year`.
- `faqSchema(items: {question; answer}[])` → `@type: 'FAQPage'` with `Question` / `acceptedAnswer` from `faqContent`.

**Typing:** define minimal local interfaces in `app/_types/structured-data.ts` (no `any`). I will **not** add the `schema-dts` dependency unless you want it (it's dev-time-only types, zero runtime cost — flagging per the "ask before adding deps" rule; default = local types).

### Placement
| Schema | Rendered in | Scope |
|---|---|---|
| `Person`, `WebSite` | `app/layout.tsx` (inside `<body>`, top) | site-wide, once |
| `BreadcrumbList` | each `work/*/page.tsx`, `work/page.tsx`, `experience/*/page.tsx`, `about`, `contact` | per page |
| `CreativeWork` | each `work/<slug>/page.tsx` | per case study |
| `FAQPage` | `contact/page.tsx` | once |

Breadcrumb trails: `Home → Work → <Case>` for case pages; `Home → Work` for the index; `Home → <Page>` for about/contact/experience.

---

## 3. Keyword & copy tuning (P2) — deliberately light

The site's copy is already strong and carefully built; this is surgical, not a rewrite.

- **Home metadata:** add an explicit `keywords` array (low weight, harmless) and confirm the home OG `title` is the full branded+role string (currently inherits the template default — fine, but make it explicit so it can't drift).
- **Image alt text:** current `coverAlt` values are good. One pass to ensure each names the project + what it shows (e.g. add platform/result context where thin). Low risk, edits confined to `work-projects.ts` strings.
- **No keyword stuffing, no copy bloat.** If a change makes a sentence read worse to a human recruiter, we don't ship it.

---

## 4. Google Search Console (P3)

### Code change: `app/layout.tsx` metadata
Add:
```ts
verification: {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
},
```
Renders the verification `<meta>` only when the env var is set — safe no-op otherwise. Document the var in `.env.production` (commented placeholder; no secret committed).

### Manual setup (you — I'll provide a numbered walkthrough)
1. Go to Search Console → add property → **Domain** property `mainul.info` (or URL-prefix `https://mainul.info`).
2. **Easiest verification:** "Google Analytics" method — works because GA4 (`G-F277NCN7RS`) is already in your `<head>` and you own both under the same Google account. No token, no code change.
3. Fallback if that fails: copy the HTML-tag token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and redeploy.
4. After verifying: submit `https://mainul.info/sitemap.xml` under Sitemaps.

### Off-page checklist (you — biggest lever for discovery terms)
- Add `https://mainul.info` to your LinkedIn (Contact info + Featured) and GitHub profile/bio.
- Reclaim the two gallery features (BestCSS, Design Nominees) — ensure they link to the current domain.
- Any agency/client pages that can credit + link you.

---

## 5. Edge cases & constraints

- **Absolute URLs** everywhere in JSON-LD (Google requires them); build from `siteConfig.siteUrl`.
- **`</script>` injection** guarded via `\\u003c` replacement in `JsonLd`.
- **No duplicate schema:** Person/WebSite only in layout; per-page schemas only on their page.
- **`sameAs` filtering:** include only real external profiles (LinkedIn, GitHub) — not mailto or the CV PDF.
- **Accessibility:** JSON-LD is non-visual; zero a11y impact. No new interactive elements, no contrast/keyboard surface.
- **Performance:** all additions are static server-rendered text; no new client JS, no new network requests, no new fonts/images. No Core Web Vitals regression.
- **Rules compliance:** no inline styles, no `@import`, no `index.ts`, no `any`, no new runtime deps, server components by default.

---

## 6. Files touched (summary)

**New**
- `app/_components/JsonLd/JsonLd.tsx`
- `app/_lib/structured-data.ts`
- `app/_types/structured-data.ts`

**Edited**
- `app/layout.tsx` — render Person + WebSite JSON-LD; add `verification.google`.
- `app/work/page.tsx` — BreadcrumbList.
- `app/work/{avsb,kemon-doctor,radius,cursimax,flatwhite}/page.tsx` — BreadcrumbList + CreativeWork.
- `app/experience/{client,gain-conversion}/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` — BreadcrumbList (+ FAQPage on contact).
- `app/page.tsx` — explicit `keywords` + OG title.
- `app/_lib/work-projects.ts` — alt-text polish (strings only).
- `.env.production` — commented `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` placeholder.

**Not changed**
- `sitemap.ts`, `robots.ts`, canonical config (already correct for apex).

---

## 7. Verification plan

1. `npm run typecheck` / `npm run lint` / `npm run build` all clean.
2. Validate each JSON-LD type with Google's Rich Results Test + Schema.org validator (structure checked locally before deploy).
3. Spot-check rendered HTML in `npm run dev` — JSON-LD present in initial source on each page type.
4. After deploy: confirm redirect direction; submit sitemap; request indexing for the homepage.
5. `futureWorks.md` updated for anything deferred (e.g. `schema-dts` if declined, image alt deep-pass).

---

## 8. Commit sequence (all on `feature/seo-improvements`)

1. `feat: add JsonLd component + structured-data builders + types`
2. `feat: render Person + WebSite schema and GSC verification in layout`
3. `feat: add breadcrumb + creativework schema to work pages`
4. `feat: add breadcrumb schema to about/experience + faq schema to contact`
5. `chore: keyword + alt-text tuning for discovery terms`

Push after each. (Note: push must be run by you — the sandbox has no GitHub credentials.)

---

## Retrospective

Implementation matched the spec. Minor deviations, all improvements or environmental:

- **Env documentation:** the GSC var was also added to the committed `.env.example` (not just the gitignored `.env.production`), so the variable is documented in the repo. Spec only mentioned `.env.production`.
- **Alt-text pass:** only `cursimax` was thin enough to warrant a change; the other four `coverAlt` strings were already strong and left untouched (spec anticipated a light pass).
- **`schema-dts`:** declined by default per the deps rule; local types used. Logged to `futureWorks.md`.
- **Git:** the sandbox could not create commits (a stale `.git` lock with un-removable permissions) and has no push credentials, so the implementation commits + push are handed to the developer as a copy-paste block rather than made automatically. File changes themselves landed normally.
- **Build verification:** `next build` compiled + passed TypeScript but the sandbox's 45s cap cut it during static page collection; full `npm run build` should be run locally as the final gate. Standalone `tsc --noEmit` and `eslint` both passed clean, and JSON-LD output was validated by executing the builders.
