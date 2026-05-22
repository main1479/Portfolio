# Plan — About + Contact (Phase 5)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch (when created):** `feature/about-and-contact`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 5 (lines 728–769), §5.5 (About components), §5.6 (Contact components), §6.6 (About content), §6.7 (Contact content), §11 (dependency policy), §12 (env vars), §13 (open questions)

---

## What

Build the `/about` and `/contact` routes — the two pages that turn the site from "a populated home page with two broken nav links" into something a recruiter or agency lead can actually traverse.

Phase 5 lands **two new routes**, **one shared component promotion**, **one new API route**, **a Zod-validated contact form with a real Resend integration**, and the self-hosted portrait image. The masterplan groups About + Contact in a single phase because (a) they share the `PageIntro` treatment, (b) they share the `Experience` section (About re-uses the home component), and (c) they're the two pages a visitor most plausibly visits in sequence ("I read his bio, now let me write to him").

The components landing in this phase, grouped by area:

### About (`/about`)

| #   | Component     | Type   | Notes                                                                                        |
| --- | ------------- | ------ | -------------------------------------------------------------------------------------------- |
| 1   | `AboutBio`    | Server | Two-column grid: sticky portrait + cards on the left, multi-paragraph bio on the right       |
| 2   | `AboutAvatar` | Server | Striped diagonal fill, self-hosted portrait via `next/image`, "Mainul Islam, 2026" tag pill  |
| 3   | `AboutCard`   | Server | Small paper-coloured info card (mono label + display value)                                  |
| 4   | `Skills`      | Server | Five skill groups, hairline-divided display tags                                             |
| 5   | `Personal`    | Server | "Outside of code." heading + short body paragraph                                            |
| 6   | `ResumeCTA`   | Server | Black card with "Want the / full CV?" heading + giant background `CV` letter + accent button |

About re-uses `Experience` from Phase 4 (see Decisions — it gets promoted out of `_components/home/`).

### Contact (`/contact`)

| #   | Component      | Type   | Notes                                                                                           |
| --- | -------------- | ------ | ----------------------------------------------------------------------------------------------- |
| 7   | `ContactAside` | Server | Left column: "Direct lines." heading + body + the three `DirectLink` rows                       |
| 8   | `DirectLink`   | Server | Row with mono label + display value + arrow circle; hover inset + accent recolour               |
| 9   | `ContactForm`  | Client | The actual `<form>`. Zod-validated, accessible errors, success state                            |
| 10  | `TopicChips`   | Client | Single-select chip group (proper `radiogroup` semantics); writes to a hidden `topic` form value |
| 11  | `FAQ`          | Server | Four native `<details>` accordions; plus → cross marker, no JS                                  |
| 12  | `FormSuccess`  | Server | Black "Message sent." card rendered conditionally inside `ContactForm`                          |

### Supporting non-component files

- **`app/about/page.tsx`** — server component composing the About sections in order.
- **`app/about/_aboutPage.module.scss`** — page-level layout (bio grid, skills grid, resume strip, personal block).
- **`app/contact/page.tsx`** — server component composing the Contact sections in order.
- **`app/contact/_contactPage.module.scss`** — page-level layout (contact grid, FAQ wrapper).
- **`app/api/contact/route.ts`** — POST handler: Zod validation → Resend send → `{ success, data?, error? }` envelope.
- **`app/_lib/contact-schema.ts`** — Zod schema + `z.infer<>` type.
- **`app/_lib/email.ts`** — thin Resend wrapper, reads `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO` from env.
- **`app/_lib/about-content.ts`** — bio paragraphs, skill groups, personal copy, resume-CTA copy.
- **`app/_lib/contact-content.ts`** — page intro, aside copy, direct lines list, topic chip labels, form labels/placeholders, success copy.
- **`app/_lib/faq-content.ts`** — four FAQ Q&A pairs.
- **`app/_types/about.ts`** — types for the about-content data.
- **`app/_types/contact.ts`** — types for the contact-content + form state union.
- **`.env.local.example`** — documents `RESEND_API_KEY`, `CONTACT_FROM`, `CONTACT_TO`, `NEXT_PUBLIC_SITE_URL` (the masterplan §12 ones; `NEXT_PUBLIC_SITE_URL` belongs to Phase 7 but the example file can declare it now so the file isn't half-empty in Phase 7).
- **`public/me.jpg`** (or `.webp`) — self-hosted portrait. Source: the GitHub avatar Mainul currently hot-links, but downloaded once, square-cropped to ≥1024×1024 and re-exported. **You will need to supply this asset** — I'll add a placeholder commit with a striped fallback if it's not in `public/` when implementation starts.

### One promotion (not a new component)

- **`app/_components/Experience/`** — `Experience.tsx` + `XpRow.tsx` + `_Experience.module.scss` get moved out of `app/_components/home/Experience/` into the top-level `_components/` namespace, because About re-uses them. See Decision §"Where does `Experience` live?".

## Why

Phases 1–4 stood up the project, the tokens, the chrome, and a fully-populated `/`. The home page tells a visitor _who Mainul is_ in three seconds and _what he does_ in twelve — but if they want the longer story or want to actually start a conversation, the two nav links that matter (`About`, `Contact`) currently 404. That's a credibility hit on a portfolio whose entire pitch is "I ship reliable frontend." Phase 5 closes the 404.

A second motivation: the Contact form is the only piece of real **backend** anywhere in the entire portfolio. It's the only spot where input validation, server-side environment variables, and a third-party API matter. Doing it deliberately, with Zod + Resend + a route handler + an envelope response, sets the pattern in case anything else in the future (an experiment endpoint, a guestbook, whatever) wants to follow.

A third: the About page is where the **self-hosted portrait** finally lands. The home page deliberately doesn't have a photo (the design language is editorial — letterforms and rules, not faces); About is where the visitor sees Mainul. Moving off the hot-linked GitHub avatar is a small but real signal that the site is its own thing, not a fancier README.

## Why now (not later)

- **It's the next phase on the masterplan.** Phase 6 (Work index + case studies) is larger and more content-dense; doing Phase 5 first means the nav stops 404-ing earlier, and it's a smaller, lower-risk piece of work to slot in between the bigger Phase 4 and Phase 6 deliverables.
- **The Contact form's `Experience` of the env-var path** (Resend keys, server-only secrets, `.env.local` + `.env.local.example`) is shared with anything future-Phase-7 might want (sitemap base URL, OG image generation). Better to walk that path once, here.
- **The `Experience` promotion is cheaper now than later.** Two consumers (home + about). Promoting it before Phase 6 (which doesn't need it) keeps the diff scoped. If we deferred it, the home → about migration would be smuggled into either a Phase 6 PR or a separate refactor PR — both worse than just doing it here.
- **Lighthouse a11y target = 100 on both pages** is set by the masterplan. The patterns for accessible form validation, `radiogroup` chip semantics, `<details>` accordion accessibility, and skip-link interaction with a long-form page are best settled before Phase 6 adds the case-study MDX pages on top.

## Scope guard — what does and doesn't ship

**Ships:**

- The twelve components above, each in its own folder under `app/about/_components/` or `app/contact/_components/` (sub-components flat inside their parent folder).
- `app/about/page.tsx` + `_aboutPage.module.scss` fully composed.
- `app/contact/page.tsx` + `_contactPage.module.scss` fully composed.
- `app/api/contact/route.ts` POST handler with Zod validation and Resend send.
- The four content + schema files (`about-content.ts`, `contact-content.ts`, `faq-content.ts`, `contact-schema.ts`).
- The `email.ts` Resend wrapper.
- `app/_types/about.ts` + `app/_types/contact.ts`.
- The promotion of `Experience` to `app/_components/Experience/` (file moves + import path updates in `app/page.tsx`).
- A `.env.local.example` documenting all four env vars.
- `public/me.jpg` (or `.webp`) — self-hosted portrait.
- Two new npm dependencies: `zod` (mandated by CLAUDE.md) and `resend` (mainstream transactional-email SDK; masterplan §11 pre-approves both). `/audit-deps` runs for record before each install.
- `prefers-reduced-motion` handling on direct-link hover transition, FAQ summary marker rotation, form input focus border colour shift, success-state reveal — i.e. anything new that animates.

**Does NOT ship:**

- `/work` index or any case-study route (Phase 6). The home page's `SelectedWork` rows continue to 404 until Phase 6 — already tracked in `futureWorks.md:11`.
- Self-hosted `cv.pdf` (Phase 7). The Resume CTA on `/about`, the `Resume` direct line on `/contact`, and the Footer's `Resume / CV ↗` meta link all continue to point at the existing Google Drive URL. Will be swapped to `/cv.pdf` in Phase 7.
- Real favicon (already tracked, Phase 7).
- OG image, sitemap, robots, full Metadata API (Phase 7).
- Count-up animation on About (masterplan §13 — "keep count-up exclusive to home for emphasis"; defaulting yes).
- Rate-limiting on the contact form (masterplan §13 — "No for v1; revisit after a month if spam appears"; defaulting yes). A small honeypot field is the only spam mitigation (see Decisions).
- Stats count-up, hero variant toggle, tweaks panel, accent persistence — all home-only, unchanged.
- Dark mode.
- Any analytics, tracking, or third-party widget.
- Any new global SCSS partials. All new styles live in component modules.

## Decisions I'm making (call them out below if you'd change any)

| Decision                                                                                  | Default                                                                                                                                                                                                                                                                                                                                                                                                                                      | Why                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Form backend — Resend, Formspree, or something else?                                      | **Resend.** Custom `app/api/contact/route.ts` handler. Zod-validated body. Sends a single transactional email to `CONTACT_TO`, from `CONTACT_FROM`, using `RESEND_API_KEY`. Returns `{ success: true, data: { id } }` on 200, `{ success: false, error: '…' }` on validation or send failure.                                                                                                                                                | Masterplan §13 default. Resend is a tiny SDK, generous free tier, mainstream and audited, and the route handler pattern is what the rest of the site would use if any other endpoint ever shows up. Formspree is a no-code shortcut that puts a third party between Mainul and his own inbox — bad fit.                                                                                                                               |
| Rate-limit the form?                                                                      | **No for v1.** No deps. No middleware. If spam shows up in the inbox, we'll add a single-IP-per-minute counter (Upstash or a tiny in-memory map) in a follow-up — explicitly out of scope here.                                                                                                                                                                                                                                              | Masterplan §13 default. Adding rate-limiting pre-spam is solving a problem that may never appear and adds a Redis dependency to the project. We pair this with a honeypot (next row) to catch the lowest-effort bots.                                                                                                                                                                                                                 |
| Honeypot anti-spam?                                                                       | **Yes — a single visually-hidden field**. Form has a `<input name="company" tabindex="-1" autoComplete="off" aria-hidden="true">` field rendered inside an `.sr-only` wrapper. If the field comes back populated, the handler returns `{ success: true, data: { id: 'noop' } }` (a deliberate lie — bots get told "yep, sent" and go away). Zod schema treats `company === ''` as the only valid value via `.refine((v) => v.length === 0)`. | Free defence against the 90% of submission bots that fill every input. No UX cost for real users. Not perfect (sophisticated bots skip it) but a meaningful filter while rate-limiting is deferred.                                                                                                                                                                                                                                   |
| Self-host the portrait?                                                                   | **Yes — `public/me.jpg` (or `.webp`)**, ≥1024×1024 source, rendered through `next/image` with `width={1024} height={1024}` (the `<AboutAvatar>` container constrains via `object-fit: cover`). The striped diagonal background stays underneath as a fallback for `onError`.                                                                                                                                                                 | Masterplan §13 default ("self-host"). The GitHub avatar URL is hot-linked today (`futureWorks.md` references this). Self-hosting also lets us serve through Next's image pipeline (LCP win), and removes the third-party request.                                                                                                                                                                                                     |
| Self-host the CV?                                                                         | **No — defer to Phase 7.** Resume CTA, contact-page direct line, and footer meta link all keep pointing at the existing Google Drive URL via `siteConfig.metaLinks` and a couple of inline `href`s in `about-content.ts` / `contact-content.ts`. A single `// TODO Phase 7: swap to /cv.pdf` comment marks each call site.                                                                                                                   | Masterplan §13 explicitly puts CV self-hosting in Phase 7 alongside the favicon, OG image, sitemap, robots, and full Metadata API. Don't slip-stream it here — it's a one-line href swap once `/cv.pdf` exists, and pulling it forward bloats the diff.                                                                                                                                                                               |
| Where does `Experience` live? (Phase 4 put it under `_components/home/`)                  | **Promote it.** Move `app/_components/home/Experience/` → `app/_components/Experience/` (file paths only — no logic change). Update the one importer (`app/page.tsx`). About imports from the new path.                                                                                                                                                                                                                                      | Two consumers now (home + about). CLAUDE.md says "three usages before extracting a shared helper" — but `Experience` was never shoved into `home/` because it was home-specific; it was put there because Phase 4 only had the home page to consume it. The masterplan §5.5 explicitly calls About's Experience block "(re-uses home component)" — i.e. it was always meant to be shared. Promoting now keeps the import path honest. |
| Skills tag rendering — re-use `<Tag>` or roll a different element?                        | **Roll a different element** — a flat `<span>` with the legacy display-font + hairline-divider styling, scoped inside `_Skills.module.scss`. `<Tag>` is the small mono pill; the Skills tags are oversize display words separated by vertical hairlines (see legacy `about.html:117–131`). Visually unrelated.                                                                                                                               | Reusing `<Tag>` would force one of: a third visual variant prop on `<Tag>`, or a strained "tag" abstraction that no longer matches the mono-pill rest of the site. The legacy treatment is a one-off; let it stay one-off inside `_Skills.module.scss`.                                                                                                                                                                               |
| Topic chips — toggle-button group or proper `radiogroup`?                                 | **Proper `radiogroup`** semantics: arrow-key navigation between chips, `role="radio"` + `aria-checked` on each, `role="radiogroup"` on the wrapper, single selectable. The hidden `topic` input still updates so the form serialises correctly.                                                                                                                                                                                              | The legacy markup has `role="radiogroup"` on the wrapper but uses `<button type="button">` with no radio role/aria-checked — keyboard users can tab through them but arrow keys don't work and there's no selection state announced. Phase 5's accessibility bar is 100, so we fix this on the way through.                                                                                                                           |
| Per-page Footer heading                                                                   | **Yes — pass a per-page `heading` prop to `<Footer>`.** About → `"Let's talk —"`. Contact → `"Or just say hi —"`. Home stays at default `"Say hello —"`. `Footer` already accepts a `heading` prop (Phase 3); just pass it from the page.                                                                                                                                                                                                    | Matches the legacy variation. `<Footer>` was built for it; not using the prop would be a regression.                                                                                                                                                                                                                                                                                                                                  |
| ContactForm — fully client, or hybrid (server form + client validation enhancement)?      | **Fully client.** `'use client'` on `ContactForm`. State machine — `idle → submitting → success                                                                                                                                                                                                                                                                                                                                              | error` — owns the loading state, the error display, and the success swap. Server returns a JSON envelope; the client renders the appropriate state.                                                                                                                                                                                                                                                                                   | A server-action / progressive-enhancement form would be the React-19-idiomatic choice, but the success state on this page is a visual swap (form vanishes, black "Message sent." card appears), not a page navigation. Doing that with `useFormState` + `revalidatePath` is more ceremony than benefit here. |
| Validation timing                                                                         | **On submit only**, not on blur. Errors render as `[role="alert"]` regions under each field, referenced by `aria-describedby`. Submit button is **not disabled** when invalid — disabled buttons hide the problem; we want the user to hit Send and see the per-field error.                                                                                                                                                                 | The `.claude/rules/accessibility.md` rule on forms is explicit about this. Per-field errors are read by screen readers because of `aria-describedby` + `[role="alert"]`.                                                                                                                                                                                                                                                              |
| Success state — replace the form in place, or scroll into view?                           | **Replace in place.** Same DOM coordinates. No auto-scroll. `aria-live="polite"` on the success card so screen readers announce it. After 12s, the success card stays — no auto-revert to a blank form (the user can refresh or navigate away).                                                                                                                                                                                              | Matches the legacy. Auto-scrolling would feel jumpy; auto-reverting could lose a follow-up the user wanted to send (just open the page again).                                                                                                                                                                                                                                                                                        |
| FAQ — `<details>` or custom accordion?                                                    | **`<details>`** with custom marker (the `plus → cross` motif). Zero JS. Keyboard support (Enter/Space toggles, focus visible) is native.                                                                                                                                                                                                                                                                                                     | `.claude/rules/accessibility.md` — "If a native element does the job, use it." `<details>` does the job. The CSS marker rotation is a `transform` transition.                                                                                                                                                                                                                                                                         |
| `.env.local.example` — include `RESEND_API_KEY` placeholder, or document only?            | **Include all four keys with placeholder values + a one-line comment per key.** Example content: `RESEND_API_KEY=re_xxxxxxxxxx  # from resend.com dashboard, server-only`.                                                                                                                                                                                                                                                                   | The masterplan §12 documents these and the spec calls out `.env.local.example`. Making the file is a 4-line job; not making it would leave a future "where do I get these keys again?" moment.                                                                                                                                                                                                                                        |
| What does the Resend handler send to `CONTACT_TO`?                                        | **Plain-text email** with subject `Portfolio · ${topic} · from ${name}`, body containing name, email (Reply-To header set to user's email so Mainul can hit reply), topic, and the message. No HTML template, no logo, no marketing chrome.                                                                                                                                                                                                  | Plain text is least likely to land in spam folders, easiest to test, and matches the rest of the design language (calm, restrained). HTML email templates are a Phase-8 problem at the earliest.                                                                                                                                                                                                                                      |
| Should the API route validate that `CONTACT_FROM` is a Resend-verified sender at runtime? | **No.** The first failed send during local testing will surface this loud and clear. Belt-and-braces upfront validation is more code, no real safety gain.                                                                                                                                                                                                                                                                                   | Resend returns a clear error message ("Domain not verified") which the handler bubbles up to the client. Don't write defensive code for an error that diagnoses itself.                                                                                                                                                                                                                                                               |

## Risk

- **Resend env vars not configured locally → form submit fails on every dev run.** Mitigation: the route handler's first action is to check `RESEND_API_KEY` exists and short-circuit with `{ success: false, error: 'CONTACT_NOT_CONFIGURED' }` (HTTP 503). The ContactForm renders the error text + a fallback `mailto:` link to keep the page useful. The `.env.local.example` is in the repo, but the actual `.env.local` is gitignored — needs to be created on first run.
- **Honeypot false positives** — if a browser autofills the hidden `company` field, real users get the silent-noop path. Mitigation: `autoComplete="off"` + `tabindex="-1"` + `aria-hidden="true"` on the field; placed visually off-screen (not `display: none`, which some autofill engines respect). Real users practically never trip it; if it becomes a problem, we strip the honeypot and revisit.
- **Self-hosted portrait LCP impact** — `next/image` does the heavy lifting (responsive `srcset`, WebP/AVIF), but a 1024×1024 source over a slow connection could still drag LCP. Mitigation: pass `priority` to the portrait `<Image>` (LCP candidate on About), and consider a `.webp` source < 80KB (already a Phase 7 polish item, not a Phase 5 blocker).
- **Form submit during a route transition** — if the user submits and then clicks a nav link before the response lands, the unmounted ContactForm calls `setState` on a torn-down component. Mitigation: standard "ignore-after-unmount" guard with an `AbortController` passed to `fetch`.
- **Skills section visual size on mobile** — the legacy uses `font-size: clamp(2.6rem, 3vw, 4rem)` for skill tags. On a 320px viewport, that floors at 2.6rem (= 26px at the project's 62.5% base) and the long words like `PostgreSQL` and `Drizzle ORM` could overflow. Mitigation: verify on iPhone SE 1st-gen, fall back to `font-size: 2.2rem` at ≤380px if needed. This is the same risk we already track in `futureWorks.md:9` for the 320px guardrail.
- **`Experience` promotion breaks the Phase 4 import** — moving the file is a path change for `app/page.tsx`. Mitigation: the move is its own commit, separate from the About implementation, so any breakage is isolated and fast to revert.
- **Lighthouse a11y target = 100** — the form is the most complex piece of accessibility work on the entire site (labels, errors, `aria-describedby`, `aria-live`, `radiogroup` chips). Mitigation: do a keyboard-only pass and a VoiceOver pass before merging; chase any single-point regression aggressively.

## What ships when this phase is done

- Visit `/about` in `npm run dev` → full About page renders: PageIntro, AboutBio (with self-hosted portrait + sticky cards + bio), Skills (5 groups), Experience (re-used from home), Personal, ResumeCTA. Nav `03 / About` link is the active state.
- Visit `/contact` → full Contact page renders: PageIntro, ContactAside (3 direct lines), ContactForm (4 fields + topic chips + submit), FAQ (4 native accordions). Nav `04 / Contact` link is the active state.
- Submit the form with valid data → real email lands in `CONTACT_TO` inbox via Resend. Form swaps to the black "Message sent." success card.
- Submit with missing/invalid fields → per-field error messages appear; submit button doesn't lock; screen reader announces the errors.
- Trip the honeypot (set the hidden field via DevTools) → handler returns `success: true` with id `noop`; no email sent.
- Click each direct line on Contact → email opens, GitHub opens in a new tab, CV opens in a new tab (Google Drive for now).
- Click "Download resume" on About → CV opens in a new tab (Google Drive for now).
- Open each FAQ accordion → plus rotates to cross, body reveals; keyboard works (Enter / Space).
- `prefers-reduced-motion: reduce` → direct-link hover slide, FAQ marker rotation, focus border colour transition, success-card reveal, reveal-on-scroll all skip; final visual state identical.
- `npm run build && npx tsc --noEmit && npm run lint` all clean.
- Lighthouse a11y on `/about` and `/contact` = 100 each (or matches Phase 4 baseline — investigate if lower).
- `.env.local.example` documents the four env vars.
- Footer heading varies per page: `Let's talk —` (About), `Or just say hi —` (Contact).
- Home page (`/`) is unchanged.

## What does NOT ship when this phase is done

- The placeholder `/work` route or any `/work/[case]` page (Phase 6). Nav `02 / Work` continues to 404.
- Stats count-up on About — explicitly skipped per masterplan §13.
- Self-hosted `cv.pdf` (Phase 7).
- Real favicon, OG image, sitemap, robots (Phase 7).
- Rate-limiting on the contact form (deferred).
- Email HTML templates (plain text only).
- Hero variant analytics (masterplan §849).
- Dark mode.
- Anything that wasn't on Phase 4's "ships" list and isn't on this phase's "ships" list either.

## What I think you might want to push back on

- **The `Experience` promotion.** It's technically a refactor of Phase 4 code and dragging it into a Phase 5 PR muddies the diff. An alternative is to leave `Experience` under `app/_components/home/` and have `app/about/page.tsx` import it from there. It would work fine. The objection is purely aesthetic — `home/` in the import path of an About page reads odd. If you'd rather punt the promotion to Phase 6 or a dedicated `refactor/` branch, easy switch.
- **The honeypot.** Some folks argue that any spam mitigation that lies to bots is a maintenance smell — better to do nothing and rely on Resend's own filters. If you prefer none-at-all until spam appears, drop the honeypot and the silent-noop branch in the handler.
- **Resend now vs. Formspree as a v1 shortcut.** Resend means env vars, a route handler, and a verified sender domain. Formspree means a `<form action="https://formspree.io/f/xxx">` and zero infrastructure. The cost-of-Resend isn't huge (the masterplan budgets for it), but if you'd rather defer the env-var path entirely until something else needs it, Formspree is a one-day swap. I default to Resend because (a) it's the masterplan default, (b) doing it once means we never go back to Formspree.
- **Self-host the CV in this phase, not Phase 7?** The Google-Drive URL is fine but it's not great — clicking it shows a Google-branded preview, not a clean download. If you have a `cv.pdf` ready, dropping it in `public/cv.pdf` and swapping the four call sites is a 10-minute add-on to this phase. I default to following the masterplan and deferring to Phase 7, but it's a low-bar swap.
- **`AboutAvatar` aspect ratio.** Legacy uses `aspect-ratio: 4/5` on desktop and `1/1` at ≤640px. The square version on mobile is the more flattering crop for a near-square avatar source. We'll need to verify both render well — if 4/5 looks bad with the GitHub-avatar-derived crop, we'll just go square everywhere.

## Out of scope (later phases or `futureWorks.md`)

- `/work` index + 3 case studies (Phase 6).
- Self-hosted `cv.pdf` (Phase 7).
- Rate-limiting on `/api/contact` — log to `futureWorks.md` as deferred at end of phase.
- HTML email templates for Resend (Phase 8+ at earliest).
- A copy of the form's `topic` field surfaced to the email subject line — already in scope (subject already includes `${topic}`).
- Resend webhook for delivery status — out of scope. The handler treats Resend's 200 response as "sent."
- A privacy-policy page — out of scope; no analytics, no tracking, nothing to declare. Re-evaluate at launch.
- Pre-hydration accent application on About / Contact — same issue tracked in `futureWorks.md:13` for home; nothing new in this phase.
