# Plan — Polish & launch readiness (Phase 7)

**Status:** Draft — awaiting approval
**Date:** 2026-05-23
**Branch (when created):** `feature/polish-and-launch`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 7 (lines 822–843), §13 (open questions for Phase 7 — CV self-hosting, OG image, domain, 404 design), §14 (non-goals — what stays out even at launch).

---

## What

The "make it shippable" phase. Phases 1–6 built every public page. Phase 7 is the final pass that takes the site from _runs locally and looks right_ to _safe to send a recruiter the link to_. No new routes, no new components on the page. Everything in this phase is _around_ the pages: metadata, social previews, favicon, search-engine discoverability, the 404 fallback, the self-hosted resume, an `npm audit` cleanup, and a final Lighthouse + real-device sweep.

The masterplan calls this "Polish & launch readiness." The bar is: paste the URL into Slack and have it render a real OG card; type the URL with a wrong slug and land on a designed 404, not Next's default error screen; run Lighthouse on every page and see ≥ 95 a11y / 100 SEO / ≥ 90 perf on mobile; have `npm audit` come back clean (or with a written reason for any remaining advisory).

Phase 7 lands **eight new files** (no new components), **edits to six existing files** (root layout, three content files, two route page.tsx files), **two new public assets** (`/cv.pdf` and a favicon source SVG), and **one `npm audit fix` pass** on the lockfile.

Concretely, the deliverables grouped by area:

### Metadata & SEO

| #   | What                             | Where                     | Notes                                                                                                                               |
| --- | -------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Full root Metadata API           | `app/layout.tsx`          | Add `metadataBase`, `openGraph`, `twitter`, `robots`, `icons`, `alternates`, `authors`. Today it only has `title` + `description`.  |
| 2   | Per-page `openGraph` + `twitter` | each `page.tsx`           | Title + description + URL per route. Inherits the OG image from root unless a page wants its own.                                   |
| 3   | Dynamic OG image                 | `app/opengraph-image.tsx` | Generated via Next's `ImageResponse` — display title + accent dot + name + role. One source of truth; per-page variants come later. |
| 4   | Twitter image                    | `app/twitter-image.tsx`   | One-line re-export of the OG image. Twitter cards prefer their own slot; sharing the asset keeps the surface single-sourced.        |
| 5   | Sitemap                          | `app/sitemap.ts`          | Static list of the 7 public routes. No `lastmod` per route yet — single shared `lastModified` from build time is enough.            |
| 6   | Robots                           | `app/robots.ts`           | Allow-all. No staging gates, no disallowed paths. Sitemap URL points at the absolute `${siteUrl}/sitemap.xml`.                      |
| 7   | Centralised `siteUrl`            | `app/_lib/site-config.ts` | New `siteUrl` const reading `NEXT_PUBLIC_SITE_URL` with a sensible local fallback. Every other metadata file imports it.            |

### Brand & assets

| #   | What           | Where                                 | Notes                                                                                                                                |
| --- | -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 8   | Favicon set    | `app/icon.svg` + `app/apple-icon.png` | Monogram "M" in display font (or a simple seal mark). Next handles `app/icon.svg` automatically; one 180×180 PNG covers Apple touch. |
| 9   | Self-hosted CV | `public/cv.pdf`                       | Drops into the repo (precondition: PDF supplied). Three call sites swap `https://drive.google.com/...` → `/cv.pdf`.                  |
| 10  | Favicon source | `public/icon-source.svg` (optional)   | Vector source if the SVG icon needs hand-editing. Skippable if `app/icon.svg` ends up trivial enough to live inline.                 |

### 404 fallback

| #   | What              | Where               | Notes                                                                                                                               |
| --- | ----------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 11  | Designed 404 page | `app/not-found.tsx` | Reuses `PageIntro` + `Footer`. Copy: `04 / NOT FOUND` label, "Couldn't find that." title, ghost-button link back to the work index. |

### Code edits (small, no new files)

| #   | Change                                    | Where                                                                                 | Notes                                                                                                                             |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 12  | CV link swap (3 sites)                    | `app/_lib/about-content.ts`, `app/_lib/contact-content.ts`, `app/_lib/site-config.ts` | One-line edits; `siteConfig.metaLinks.Resume` and the two content files' resume buttons all point at `/cv.pdf`.                   |
| 13  | Per-page openGraph blocks                 | `app/page.tsx`, `app/work/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`     | Plus the three case `page.tsx` shims — frontmatter already carries `pageTitle`/`pageDescription`, just plug into `openGraph` too. |
| 14  | `npm audit fix` (or documented exception) | `package-lock.json`                                                                   | Resolve the 2 moderates from `futureWorks.md`. If transitive and unfixable, write a one-paragraph note in the spec.               |

### Verification (no files, but mandatory)

| #   | Check                      | Notes                                                                                                                                                 |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | Lighthouse on all 7 routes | Mobile preset. Target: ≥ 90 perf, ≥ 95 a11y, 100 best-practices, 100 SEO. Document any gap inline in the spec.                                        |
| 16  | OG card preview            | Paste the deploy preview URL into Slack, Twitter (or X), iMessage, Discord. Card renders with the dynamic OG image. Screenshot for the retrospective. |
| 17  | Real-device pass           | iPhone 12 + Pixel 5 + iPad Mini via DevTools device toolbar. 320px guardrail (iPhone SE 1st gen) via DevTools custom width.                           |
| 18  | Email rendering pass       | Send a contact-form submission. Check the notification + confirmation in Gmail web, Gmail mobile, Apple Mail, Outlook web. Tweak any breakages.       |

## Why

Phase 6 closed the navigation loop — every page resolves, every case study reads. The site _works_. But it doesn't yet present itself well outside the browser tab:

- **Paste the URL in Slack → it renders as a generic "Mainul Islam · Frontend Developer …" text link with no preview image.** OG cards are how technical readers first form a visual impression of a site. Shipping without one is the equivalent of submitting a printed resume on copier paper.
- **Type `/work/asdf` → Next's default 404 screen.** A frontend developer's portfolio failing at "this URL doesn't exist" is a credibility hit out of proportion to the technical effort. A designed 404 is ten minutes of work that catches every wrong link forever.
- **`metadataBase` not set → relative OG/twitter image URLs resolve incorrectly in some clients.** Next's metadata API needs a `metadataBase` to produce absolute URLs for social-card crawlers. Skipping it works locally and breaks in production.
- **CV still points at a Google Drive viewer.** Drive's viewer adds a one-click hurdle, shows a non-portfolio chrome around the document, and breaks if Drive temporarily 503s. Self-hosting the PDF is one upload, removes the dependency, and lets the link behave like every other.
- **No sitemap, no robots.** Search engines _can_ still crawl, but it's slower and it tells anyone who looks "this site was not finished." For a portfolio whose pitch is _attention to detail_, that's a contradiction.
- **`npm audit` reports two moderate advisories** (tracked at `futureWorks.md`). They've been deferred through three phases. Closing them, or writing the reason they can't be closed, belongs in launch readiness.

The cheaper framing: **all of these are little gaps that any visitor _won't notice_ if they're present, but _will notice_ if they're absent.** The asymmetry is the whole reason this phase exists.

## Why now (not later)

- **It's the last phase before launch.** Phase 8 is optional ("show, don't tell" — live experiments on top of the site itself) and explicitly _not v1_. Phase 7 ships first because Phase 8 builds on top of a launched site, not a pre-launch one.
- **OG images are easier to author once than to retrofit.** The masterplan defaults to a dynamic `app/opengraph-image.tsx` that reads tokens from `_variables.scss`/`site-config.ts`. Writing that with the design system fresh and the home page hero treatment in mind makes the OG card match the site by construction. Doing it later means re-reading the design system from scratch.
- **The CV link is in three places.** Swapping it post-launch means three tiny PRs, three preview deploys, three Lighthouse re-checks. Swapping it in the same PR that adds the `/cv.pdf` asset is one PR.
- **Real-device testing requires the site to be otherwise complete.** Phase 6 completed the last set of pages. The first time the full site sees a real iPhone screen should be _before_ the Vercel domain goes live, not after.
- **`npm audit` results compound.** The two moderates have sat through Phases 3–6 with no churn. Resolving them now while no other dep changes are in flight gives a single clean snapshot to compare against post-launch advisories.

## Scope guard — what does and doesn't ship

**Ships:**

- The eight new files above (`app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx`, `app/icon.svg`, `app/apple-icon.png`, `public/cv.pdf`).
- The six modified files (root layout, three content files, two of the case `page.tsx` shims that pick up OG-specific frontmatter — see Decisions).
- A `siteUrl` constant added to `app/_lib/site-config.ts`, plus `NEXT_PUBLIC_SITE_URL` in `.env.local.example`.
- Resolution (or documented exception) for the two moderate advisories from `npm audit`.
- Per-page `openGraph` + `twitter` metadata on every route.
- A 404 page styled to match the rest of the site.
- The futureWorks Resolved-section entries for: `[scaffold] favicon`, `[assets] /cv.pdf self-hosting`, `[deps] npm audit moderate vulnerabilities`.
- A Lighthouse-pass screenshot or transcript per route, attached to the retrospective in the spec.
- Optional micro-fix: the pre-hydration accent flash (`futureWorks.md`'s `[perf]` entry) — IF it's a clean inline `<script>` insert. Tagged optional in the spec; can be punted to a follow-up.

**Does NOT ship:**

- Per-case OG images. The root OG image covers all 7 routes in v1. Per-page variants are a "later" item — listed in Out of scope.
- Dark mode (masterplan §14).
- A blog / writing section (masterplan §14).
- i18n (masterplan §14).
- Cookie banner (no tracking → no cookies → no banner).
- View-transition API between routes (masterplan §14, "fine to explore as an enhancement later, but not for v1").
- Analytics or tracking pixels (masterplan §11 forbids them by default).
- New components or page layouts. Phase 7 doesn't touch component logic — only the surrounding chrome.
- Custom domain setup (`mainulislam.dev`). Documenting the value and the Vercel dashboard steps belongs here; the actual DNS configuration is a manual outside-the-repo step. See Decisions.
- Phase 8 (live experiment surface).

## Decisions I'm making (call them out below if you'd change any)

| Decision                                                                                                              | Default                                                                                                                                                                                                                                                                                                                                                    | Why                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`metadataBase` source — env var, hardcoded, or `siteConfig` constant?**                                             | A `siteUrl` constant in `app/_lib/site-config.ts`, reading `process.env.NEXT_PUBLIC_SITE_URL` with a fallback to `http://localhost:3000`. The constant is the single source of truth — every metadata file imports it. Set the env var in Vercel project settings to the production URL.                                                                   | Centralised, typed, no risk of one file forgetting the URL. The fallback means dev `npm run dev` works without a `.env.local` entry, and the env-var lookup is one place to swap if the domain changes.                                                                                      |
| **OG image — dynamic via `ImageResponse`, or static PNG?**                                                            | **Dynamic**, via `app/opengraph-image.tsx`. Uses Next's built-in `ImageResponse` (no extra dep). Renders the display title, name, role, and an accent-coloured dot. Background = `--bg`; type colour = `--fg`; accent = `--accent`'s default `#1f3a5f` (not the persisted runtime value — OG images are static per build).                                 | Same single-source-of-truth argument as `metadataBase`. A dynamic OG image lets later phases produce per-case variants without touching the masterplan. Static PNG is faster to ship but more annoying to update. Cost is small — `ImageResponse` doesn't add to bundle size.                |
| **OG image typography — `next/font`, fetched web font, or system stack?**                                             | **System stack** — `font-family: 'Helvetica Neue', Arial, sans-serif` for everything in the OG image. Next's `ImageResponse` can't read `next/font` results at render time; the alternative is fetching a self-hosted WOFF subset of Teko, which adds asset weight and a build-time fetch with no real visual win for OG.                                  | The OG image is a 1200×630 px crop seen at thumbnail size in 90% of cases. System-stack large display text reads fine at that size. Avoids a moving part.                                                                                                                                    |
| **Favicon — SVG monogram, generated via `app/icon.tsx`, or both?**                                                    | **Single `app/icon.svg`** — a small hand-authored monogram "M" stroked in the display font weight, on the cream background. Plus `app/apple-icon.png` at 180×180 px (a one-time PNG export of the same mark). Next handles both filenames automatically — no `metadata.icons` config needed.                                                               | Smallest possible footprint. `app/icon.tsx` with `ImageResponse` is overkill for a single mark that never changes. The 180×180 PNG covers Apple touch icon spec; everything else uses the SVG.                                                                                               |
| **CV PDF — required for this phase, or optional?**                                                                    | **Required.** The PDF must be supplied before Phase 7 is "done." If the PDF isn't ready when the implementation phase starts, the swap line items get punted to a follow-up commit. See Risk.                                                                                                                                                              | The masterplan §13 default ("self-host") relies on the PDF existing. Without it, the swap is a one-line edit waiting for the asset. Best to flag now rather than ship a "/cv.pdf 404" link.                                                                                                  |
| **`mainulislam.dev` — register and configure in this phase, or just plumb the env var and ship to vercel.app first?** | **Plumb the env var only.** Set `NEXT_PUBLIC_SITE_URL` to whatever Vercel auto-generates (eg `mainulislam-portfolio.vercel.app`) for the first preview. Buy the domain + configure DNS as a separate manual step once the rest of Phase 7 is verified. The codebase doesn't care which URL it gets — `siteUrl` is one config value.                        | Domain registration involves payment, payment requires the actual decision to launch under that name, and DNS propagation is async. Treating it as a separate step means Phase 7 isn't blocked on it.                                                                                        |
| **`app/sitemap.ts` — return all 7 routes statically, or read from a registry?**                                       | **All 7 hardcoded.** The route list is small and stable. The `workProjects` array could feed the 3 case routes programmatically, but the home/about/contact/work-index are special-cased anyway. Three hardcoded `/work/<slug>` lines are clearer than a `.filter(p => p.hasCase).map(...)` loop.                                                          | Premature abstraction — `workProjects` was extended in Phase 6 specifically to drive the index page, not sitemaps. Re-using it here would couple two concerns. Static array is fine.                                                                                                         |
| **`app/robots.ts` — static `MetadataRoute.Robots` export, or a function?**                                            | **Static export.** Allow `*` for all user agents on all paths, set `sitemap` to the absolute sitemap URL. No staging gating logic — there's no staging env.                                                                                                                                                                                                | Matches the "no analytics, no tracking, no cookies" minimalism of the rest of the project.                                                                                                                                                                                                   |
| **404 page — match `page-intro` layout, or roll a one-off design?**                                                   | **Match `page-intro`** — same label/title/sub treatment as `/work` and `/about`. Copy: label `04 / NOT FOUND`, title `Couldn't find / that.`, sub `That URL doesn't lead anywhere. Try the work index or head home.`, plus a `<Button>` linking to `/work` and a plain link to `/`. Uses `<Footer>` with the default heading.                              | The page-intro pattern is what the visitor's eye expects everywhere else. Reusing it ships an on-brand 404 in roughly 20 lines. A bespoke design risks looking like a placeholder.                                                                                                           |
| **Pre-hydration accent flash fix — in this phase, or punt?**                                                          | **In, behind a "if cleanly buildable" flag.** Add a small inline `<script>` in `app/layout.tsx`'s `<head>` that reads `localStorage['mn-accent-v2']` and sets `document.documentElement.style.setProperty('--accent', value)` before paint. If it conflicts with the existing `Loader` or `HomeShell` accent application, defer to a follow-up.            | The `futureWorks.md` entry explicitly tags this as a "Phase 7 polish." It's three lines if it works cleanly. The risk is interaction with `HomeShell`'s mount effect, which Phase 7 isn't otherwise refactoring. Spec calls this out as a 30-minute spike — keep or revert based on outcome. |
| **`twitter-image` — separate file or alias of opengraph-image?**                                                      | **Separate one-line file** that re-exports the OG image generation function. Next requires `app/twitter-image.{ext}` to exist; pointing it at the OG renderer avoids duplication.                                                                                                                                                                          | Twitter's card crawler often falls back to OG anyway, but Twitter Cards spec gives them their own slot. Having both lets future per-page Twitter overrides happen without touching OG.                                                                                                       |
| **Per-page `openGraph` blocks — author by hand on each page, or compute in a helper?**                                | **Author by hand.** Six pages, six small blocks: title, description, URL, type. Pulling into a helper would be ten lines saved at the cost of one more level of indirection. CLAUDE.md: "three usages before extracting a shared helper" — and even at six, the strings are different enough that any helper would be a record of strings, not a function. | Code is cheaper than indirection here.                                                                                                                                                                                                                                                       |
| **`npm audit` strategy — `npm audit fix --force`, manual updates, or document exception?**                            | **Manual investigation first.** Read what the two moderates are; check if they're transitive (no fix available) or direct deps. Update the direct dep if there's a non-breaking patch; document the transitive (with a one-paragraph note in the spec) and move on. Never use `--force` — it breaks lockfile pins.                                         | Static portfolio site with no PII flow — the bar for "moderate transitive" is "document, don't fix at the cost of a regression." For direct deps, take the safe update.                                                                                                                      |
| **Lighthouse runs — manual via Chrome DevTools, or scripted via CLI?**                                                | **Manual via Chrome DevTools.** Once per route on the final Vercel preview URL. Screenshot the score panel; attach the screenshots (or the four scores per route) to the spec's verification section.                                                                                                                                                      | Scripted Lighthouse is what's done in CI on a real engineering project. This site has no CI, and the goal is "I ran it" not "we keep running it." Manual is honest about the cadence.                                                                                                        |
| **Self-host `me.jpg` — already done, or audit?**                                                                      | **Audit only.** `public/me.jpg` already exists from Phase 5. Phase 7 verifies it loads via `next/image` everywhere it's referenced and that no `<img>` tag still hot-links a GitHub avatar. No new asset work.                                                                                                                                             | The masterplan listed self-hosting as a Phase 5/7 item; Phase 5 took the work. Phase 7 confirms the cleanup landed.                                                                                                                                                                          |

## Risk

- **CV PDF not supplied at implementation time.** Without `public/cv.pdf`, the swap lines can't ship. **Mitigation:** keep the Google Drive link in place if the PDF isn't ready; ship every other Phase 7 deliverable; add a `futureWorks.md` line targeting a fast follow-up swap once the PDF lands.
- **`ImageResponse` + `next/font` interaction.** Next's docs are clear that `next/font` results aren't available inside `ImageResponse`. If we forget and try to import Teko, the OG image build either crashes or silently falls back. **Mitigation:** the default decision is system-stack typography in the OG image. If a future spec wants display-font OG text, it adds a self-hosted WOFF fetch.
- **`metadataBase` with a placeholder URL leaks to production.** If `NEXT_PUBLIC_SITE_URL` isn't set in Vercel, the fallback `http://localhost:3000` would ship in absolute URLs. **Mitigation:** the spec's verification step explicitly checks the Vercel deploy preview's `<link rel="canonical">` and OG `og:url` for an `http://localhost` prefix. Catching it at preview-deploy time is the right gate.
- **`npm audit fix` rewrites the lockfile.** Even non-force fixes can move transitive versions by minor or patch. **Mitigation:** run `npm audit fix` in a separate commit before the metadata work. Build + dev-server sanity check after the lockfile changes. If anything regresses, revert and document the advisory instead.
- **Pre-hydration accent script vs HomeShell mount effect.** The home page already applies the persisted accent inside `HomeShell`'s effect. Inlining a `<script>` that does the same thing in `<head>` creates two writers to the same `--accent` variable. **Mitigation:** the inline script writes the variable first; `HomeShell`'s effect becomes idempotent (read current `--accent` from `getComputedStyle`, only write if it differs). Spec calls out the contract.
- **`app/icon.svg` rendering.** Some browsers don't render SVG favicons reliably (older Safari, some Android Chrome variants). **Mitigation:** ship `app/apple-icon.png` at 180×180 as the broad-compatibility fallback. Browsers that can't read the SVG read the PNG.
- **OG card cached by social platforms.** Slack, Twitter, Facebook all cache OG cards aggressively. **Mitigation:** if a card looks wrong on first paste, append `?v=1` to the URL when pasting again — most cache layers re-fetch on a different query string. Document this in the verification section.
- **Lighthouse a11y < 100 on the home page.** The home page's `TweaksPanel` + `Hero` variant toggle + Stats animation are the most complex a11y surface. **Mitigation:** if a score drops below 95, the spec's verification step requires identifying the specific axe rule and fixing or documenting. Don't paper over with `aria-hidden`.
- **Real-device 320px guardrail surfaces a layout break that didn't show in DevTools.** **Mitigation:** if anything breaks at 320px on real hardware, fix in the spec's verify loop. The clamp guardrails landed in Phases 4–6 should hold; this is a verification step, not a feature.

## What ships when this phase is done

- Paste `https://<deploy-preview>.vercel.app` into Slack → renders an OG card with the dynamic image (display title + accent dot + name + role). Same in Twitter/X, iMessage, Discord.
- Visit any URL that doesn't exist → the designed 404 page renders. Click "Try the work index" → lands on `/work`.
- Click "Resume / CV" from the nav meta links, About resume button, or Contact lines → the browser opens `/cv.pdf` directly. No Google Drive viewer chrome, no third-party redirect.
- `app/icon.svg` shows up as the favicon in the browser tab; on iOS, the home-screen save button uses the 180×180 PNG.
- `https://<deploy-preview>.vercel.app/sitemap.xml` returns a valid XML sitemap with all 7 routes. `/robots.txt` returns the allow-all robots with the sitemap URL.
- View any page's source → `<title>`, `<meta name="description">`, `<meta property="og:image">`, `<meta property="og:url">`, `<meta name="twitter:card">`, `<link rel="canonical">`, `<link rel="icon">`, `<link rel="apple-touch-icon">` all present and pointing at absolute URLs.
- `npm audit` reports 0 vulnerabilities, OR reports only transitives with a documented note in `futureWorks.md`.
- Lighthouse mobile on every public route: perf ≥ 90, a11y ≥ 95, best-practices = 100, SEO = 100. Documented in the spec's verification section.
- 320px viewport (iPhone SE 1st gen) — every page reads without horizontal scroll or overflow. Verified on real hardware OR documented as "verified in DevTools only" with a `futureWorks.md` entry to confirm on real hardware post-launch.
- Email rendering pass: a real submission through the contact form arrives in Gmail web, Gmail mobile, Apple Mail, Outlook web with the notification + confirmation templates rendering correctly.
- `futureWorks.md` Resolved section gains: `[scaffold] favicon`, `[assets] /cv.pdf self-hosting`, `[deps] npm audit moderates`. Optional: `[perf] pre-hydration accent flash`. Open section gains anything knowingly punted.
- The masterplan §10 Phase 7 checkboxes are all green.

## What does NOT ship when this phase is done

- The custom domain (`mainulislam.dev`). Plumbing for it is in place; the actual DNS configuration is manual + outside the repo.
- Per-case-study OG images. Root OG image covers everything. Logged to `futureWorks.md` for a later phase.
- View-transition API between routes.
- Dark mode, i18n, blog, cookie banner, analytics, search — all masterplan §14 exclusions.
- Phase 8 (live experiment surface).
- A CI workflow. Local-only is still the policy (`CLAUDE.md`).
- A "back-to-top" button on long pages (default to native browser scroll).
- Rate-limiting on the contact form (`futureWorks.md` defers; "revisit after a month if spam appears").

## What I think you might want to push back on

- **The OG image typography in system fonts.** If you'd rather match the editorial Teko display look, I'm happy to self-host a WOFF subset of Teko and load it inside `ImageResponse`. Cost: one new public asset (~30–60 KB), one font-fetch call in the OG renderer, one more thing that can fail. I defaulted to system-stack because OG cards are tiny in most clients and the Teko personality is mostly lost at thumbnail scale. If the recruiter-eyeball test wants the brand voice in the OG, flip this.
- **Single OG image vs per-case variants.** Three case pages with their own OG images would put the case display titles directly in the social preview — strong move for sharing a specific case study link. Cost: three more `opengraph-image.tsx` files (one per case route), each ~30 lines, each pulling from the case's frontmatter. I defaulted to one shared image because the most common share is the root URL, not a case URL, and one image keeps the surface tight. If you'd rather invest the hour now, the change is mechanical.
- **The pre-hydration accent flash fix.** I defaulted to "in, if buildable." If you'd rather punt to a clear follow-up phase, the flash is small (the page loader masks most of it already) and removing the script keeps `app/layout.tsx` a fully server component with no inline JS. I included it because `futureWorks.md` explicitly tags it as a Phase 7 item.
- **404 page using `<PageIntro>`.** If you'd rather a more bespoke 404 (a giant outlined `404`, an accent stripe, anything that signals "this is the not-found page" more loudly), I'm happy to roll one. I defaulted to `<PageIntro>` because it's the right shape for "label + title + sub + CTA" and it's already polished. The downside: a visitor who scrolls past three pages with the same intro pattern then lands on a 404 might miss the cue.
- **`mainulislam.dev` registration timing.** If you've already registered the domain, we can roll the DNS + Vercel domain step into this phase rather than punting. The cost is dependency on DNS propagation (24-48h sometimes) inside a phase the rest of which is local-only. I defaulted to "plumb the env var, do the domain separately" so the Phase 7 PR isn't blocked on a propagation timer.
- **CV PDF as a hard precondition.** If you don't have a final PDF ready, we ship Phase 7 with the CV swap punted to a follow-up. Three lines of work, lands within a day of the PDF being supplied. I called it a precondition because that's the cleanest version of Phase 7 — but it's also the version that might delay merging.
- **`npm audit` exception language.** If the two moderates turn out to be transitive (which they usually do for build-only deps under Next), I'd document them in `futureWorks.md` and move on. If you'd rather aggressively update (eg upgrade transitive parents to versions that bring patched children), it's a bigger PR — typically nothing user-visible breaks, but `npm install` does. I defaulted to the lighter touch.

## Out of scope (later phases or `futureWorks.md`)

- **Per-case OG images** — log as `[meta] per-case-study OG images (use case display title + accent treatment) — augment app/opengraph-image.tsx with case-specific variants once Phase 7 ships`.
- **Real case-study screenshots** (still tracked from Phase 6) — replace striped-fill placeholders in `<CaseVisuals>`.
- **Rate-limiting on `/api/contact`** — `futureWorks.md` defers; revisit if spam appears.
- **Pre-hydration accent application** — only in Phase 7 if the fix is clean; otherwise stays in `futureWorks.md`.
- **Custom domain DNS + Vercel domain config** — separate manual step.
- **View-transition API between routes** — masterplan §14, v2.
- **Phase 8: live experiment surface** — optional, masterplan §10.
- **CI workflow** — local-only stays the policy.
- **`additionalData` Sass workaround removal** (`futureWorks.md:14`) — investigate in a chore phase, not a launch phase.
- **A real Lighthouse-in-CI setup** — would require a CI workflow first. Out for v1.
- **Per-environment metadata (staging vs prod)** — there is no staging env. Don't invent one.
