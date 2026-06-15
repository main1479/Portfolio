# SEO Improvements — Plan

**Status:** Awaiting approval
**Goal:** Rank higher on Google for (1) branded searches — "Mainul Islam" and variants — and (2) discovery / hire-intent searches — "A/B testing frontend developer", "experimentation engineer", "Optimizely developer", etc.
**Date:** 2026-06-15

---

## The honest framing first

SEO is not a switch. No on-page change forces Google to rank a site higher overnight, and anyone who promises that is selling snake oil. What we *can* do is remove every technical reason Google might have to rank the site lower, make the page's meaning machine-readable, and give Google the structured signals it uses to build a Knowledge Panel and rich results. Combined with the off-page work (links, profiles) that only you can do, this is what actually moves rankings — over weeks, not hours.

The good news: this site's foundation is already better than ~90% of portfolios. The work below is about closing specific, real gaps — not a rebuild.

---

## What's already good (no action needed)

- Per-page `title` / `description` metadata on every route, with a sensible title template.
- Open Graph + Twitter card metadata, with generated 1200×630 OG images.
- `robots.ts` and `sitemap.ts` present and correct, sitemap linked from robots.
- Canonical tags on every page.
- Semantic HTML, skip link, `lang="en"`, good heading structure.
- Server-rendered content (Googlebot sees real HTML, not an empty JS shell).
- GA4 already installed.

---

## The gaps we'll fix (priority order)

### P0 — Canonical vs. www mismatch (correctness bug)

`mainul.info` 301-redirects to `www.mainul.info`, but the canonical tag declares the **non-www** `https://mainul.info` as authoritative. So the URL Google lands on and the URL the page says is the "real" one disagree. This splits ranking signals between two hostnames and is the kind of inconsistency that quietly caps a site.

**Fix:** Pick one canonical host and make the redirect, the canonical tags, the sitemap, and the OG URLs all agree. Recommendation: standardise on **`https://www.mainul.info`** (matches the current live redirect, so nothing breaks for existing links), set via the `NEXT_PUBLIC_SITE_URL` env var so every generated URL follows. *(If you'd rather be on the apex `mainul.info`, that's also fine — it just means changing the Vercel redirect instead. One decision needed from you; see "Open questions".)*

### P1 — No structured data (JSON-LD) — biggest content win

There is zero `schema.org` markup on the site. For a *named individual*, this is the single highest-leverage SEO addition. It's how Google understands "this site is about a person named Mainul Islam, who is a frontend developer, here are his verified profiles" — the raw material for a Knowledge Panel and for richer search results.

We'll add:
- **`Person`** schema (site-wide): name, job title, description, `url`, `image`, and `sameAs` pointing to your LinkedIn + GitHub. `knowsAbout` listing your real skills (A/B testing, Optimizely, AB Tasty, Next.js, etc.) — this directly supports the discovery-term goal.
- **`WebSite`** schema (site-wide): ties the domain to you as author/publisher.
- **`BreadcrumbList`** on work/experience pages: enables breadcrumb rich results in search listings.
- **`CreativeWork`** (or `Article`) per case study: makes each case study eligible to surface on its own.
- **`FAQPage`** on the contact page (you already have a real FAQ component) — eligible for expandable FAQ rich results.

### P2 — Keyword & copy tuning for discovery terms

Branded search you'll win easily once the above ships. Discovery terms ("A/B testing frontend developer", "experimentation engineer for hire", "Optimizely developer") are competitive and need the target language to actually appear in the highest-signal places:
- Tighten the home `<title>` and `<h1>` so the primary discovery phrase reads naturally near the front.
- Ensure each discipline/section has a real heading using the phrase a recruiter would type.
- Add descriptive, keyword-aware `alt` text to case-study images (currently functional but thin).
- Strengthen internal linking (descriptive link text between home → work → case studies) so Google understands the site's topical structure. No "read more"; say what the link goes to.

We will **not** keyword-stuff. Google penalises it, and it reads badly to the humans who matter (recruiters).

### P3 — Search Console verification + crawl hygiene

- Add a Google Search Console verification meta tag (via env var) so you can actually *measure* impressions, queries, and click-through — SEO without measurement is guessing. **This needs a verification token from you** (see "Open questions").
- Confirm the sitemap covers every indexable route and excludes the ones it should (the `/cv` route is already disallowed in robots — verify that's intended).

---

## Explicitly out of scope (and why)

- **No black-hat tactics.** No link schemes, cloaking, doorway pages, or hidden text. These get sites de-indexed and would torch your credibility as the developer the site is selling.
- **No new third-party scripts/widgets** beyond what's listed — your rules forbid it without sign-off, and they hurt performance (a ranking factor) anyway.
- **Off-page work I can't do for you, but that matters most for discovery terms:** getting your site linked from your LinkedIn/GitHub profiles, dev community profiles, the design galleries that already featured you (BestCSS, Design Nominees), and any client/agency pages. I'll give you a short checklist for this.

---

## How we'll know it worked

- **Immediately:** structured data passes Google's Rich Results Test; build/typecheck/lint clean; canonical + redirect + sitemap all agree on one host.
- **Days:** Search Console verified and receiving data; sitemap submitted and pages indexed.
- **Weeks:** branded query "Mainul Islam" surfaces the site with sitelinks/Knowledge Panel; discovery queries begin appearing in Search Console impressions.

## Open questions for you

1. **Canonical host:** standardise on `www.mainul.info` (no redirect change needed) or apex `mainul.info` (you change the Vercel redirect)? Default: `www`.
2. **Google Search Console:** do you already have a property? If not, I'll wire the verification meta tag and hand you the 2-step setup; you'll need to paste a token or drop a token into `.env`.
3. Anything you specifically want to rank for that I haven't listed?

---

*Next step after approval: I write the technical spec (`_specs/seo-improvements-spec.md`) detailing exact files, schema shapes, and edge cases, then pause again for your sign-off before any code changes.*
