# Plan — Layout shell (Phase 3)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch (when created):** `feature/layout-shell`
**Masterplan reference:** `docs/MASTERPLAN.md` §5.1 (universal primitives), §7 (interactions), §8 (accessibility), §10 (Phase 3)

---

## What

Stand up every piece of "site chrome" so that the Nav, Footer, custom cursor, and scroll-reveal all work on every route. The pages themselves (Home, Work, About, Contact, cases) stay as the Phase 1/2 placeholders — this phase is about everything that wraps them.

The thirteen components that land in this phase:

| #   | Component      | Type                          | Notes                                                                      |
| --- | -------------- | ----------------------------- | -------------------------------------------------------------------------- |
| 1   | `Nav`          | Client                        | Fixed top, scroll-state, mobile drawer, `usePathname()` active link        |
| 2   | `Footer`       | Server (with default content) | Big CTA + meta links + giant stroked wordmark + legal line                 |
| 3   | `CustomCursor` | Client                        | Mounted in layout; only renders on `(hover: hover) and (pointer: fine)`    |
| 4   | `RevealRoot`   | Client                        | Single mount-level IntersectionObserver that watches every `.reveal` node  |
| 5   | `Reveal`       | Server                        | Thin wrapper that sets `className="reveal"` and an optional `data-delay`   |
| 6   | `Arrow`        | Server                        | The one SVG arrow that the whole site uses, with `size` + `strokeWidth`    |
| 7   | `Container`    | Server                        | `<div class="container">` (and `--narrow` variant)                         |
| 8   | `Section`      | Server                        | Vertical-rhythm wrapper, with `first` prop to drop top padding             |
| 9   | `SectionHead`  | Server                        | Mono index label + display title pair (with accent dot)                    |
| 10  | `PageIntro`    | Server                        | Big-label + display-title block used on Work/About/Contact/cases           |
| 11  | `Button`       | Server / client per use       | `variant` of `default \| ghost \| accent`, `href` to render as `next/link` |
| 12  | `TextLink`     | Server                        | The underlined arrow link motif (`.tlink`)                                 |
| 13  | `TickRule`     | Server                        | 21 spans inside a hairline rule, every 5th tick taller + darker            |
| 14  | `MonoLabel`    | Server                        | Tiny shorthand for `<span class="mono">…</span>` and the `-sm` variant     |
| 15  | `Tag`          | Server                        | Rounded pill, mono uppercase — base style for case/service tags            |

(That's fifteen, not thirteen — `Reveal` and `RevealRoot` are a pair, and `TextLink` slipped past the title. They all belong in this phase; counting was sloppy on my end. Calling it out so you know I'm not smuggling extras in.)

Plus the two non-component files:

- **`app/layout.tsx`** — wires in `<RevealRoot>`, `<CustomCursor>`, `<Nav>`, and `<Footer>` around `{children}`. The Phase 1 placeholder version goes away.
- **`app/_lib/site-config.ts`** — one object with nav links, social/meta links, the owner's name + email, and the site version string. Every component that needs to render a link to GitHub, the CV, the email address, or one of the nav routes reads from this file.

## Why

The current `app/layout.tsx` is the bare Next.js scaffold — `<html><body>{children}</body></html>` plus next/font wiring. Nothing about the page identifies as "Mainul's portfolio." Until the chrome exists, every Phase-4+ page would have to either (a) ship without a nav and footer (which makes them un-reviewable), or (b) hand-roll its own chrome (which guarantees drift).

A second motivation: Nav, Footer, CustomCursor, and the reveal pipeline are all behaviours that need to live exactly once at the layout level. If we deferred them to "whenever a page needs them," we'd end up with a `<Nav>` on `/` and a slightly different `<Nav>` on `/work` two months later. Better to settle the chrome before we even open the home page.

A third: the small primitives (`Container`, `Section`, `SectionHead`, `Button`, `TextLink`, `Arrow`, `PageIntro`, `TickRule`, `MonoLabel`, `Tag`) are the LEGO bricks that every later page composes from. Building them in their own phase, in isolation, means Phase 4 onward can be pure page composition — almost no new low-level CSS gets written from here on. That's how you keep visual consistency across the site without a Storybook or a token-audit cycle.

## Why now (not later)

- **Blocks Phase 4.** The home page (`/`) is the next thing on the roadmap and it cannot start until at least the Nav, Footer, Container, Section, SectionHead, Button, Reveal, and TickRule primitives exist.
- **Blocks Phase 5 (About + Contact)** and **Phase 6 (Work + cases)** for the same reason — they all rely on `PageIntro`, `Section`, `Container`, `Reveal`, `Tag`, and `TextLink`.
- **Lighthouse a11y baseline.** With the chrome in place and the pages still empty, we can run Lighthouse against `/`, `/work`, `/about`, `/contact` and a placeholder `/work/foo` to get a single, comparable baseline number. After this we'll add content per phase, and any score regression will be attributable to the content phase, not the chrome.

## Scope guard — what does and doesn't ship

**Ships:**

- The fifteen components above, each in its own folder under `app/_components/` (or flat file for the trivial ones — see Decisions below).
- `app/_lib/site-config.ts`.
- The rewritten `app/layout.tsx`.
- Reveal-on-scroll CSS in `app/_styles/globals.scss` (`.reveal` + `.reveal.is-inview` + the staggered `data-delay` rules). The Phase 2 spec explicitly deferred these here; this is where they land.
- A `app/page.tsx` left as a placeholder that still says "Portfolio scaffolded." but inside `<Container>` + `<Section>` so we can see the chrome wrapping it correctly. The real home page is Phase 4 — we do NOT build any of the Hero/Marquee/Intro/Stats/Services/SelectedWork/SelectedClients/Recognition/Experience/EndCTA/TweaksPanel components here.

**Does NOT ship:**

- Anything home-page (`Hero`, `Marquee`, `Intro`, `Stats`, `Services`, `SelectedWork`, `SelectedClients`, `Recognition`, `Experience`, `EndCTA`, `TweaksPanel`).
- Anything case-page (`CaseHero`, `CaseMeta`, `CaseBlock`, `CaseVisuals`, `CodeMock`, `NextCase`, `Countries`, `CaseLayout`).
- The work index (`Filters`, `IndexRow`) or any MDX wiring beyond what the Phase 1 scaffold already does.
- The contact form, FAQ, or the Resend integration.
- The about page bio, skills grid, or resume CTA.
- A real favicon (already tracked in `futureWorks.md`).
- A self-hosted portrait.
- Any new npm dependency.
- Any analytics, tracking, or third-party widget.
- Dark mode.

## Decisions I'm making (call them out below if you'd change any)

| Decision                                                                  | Default                                                                                                                                                                                           | Why                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where `.reveal` styles live                                               | `app/_styles/globals.scss` (appended to the existing keyframes section)                                                                                                                           | The class name is a literal `"reveal"` string — `<Reveal>` writes `className="reveal"` so the `RevealRoot` `querySelectorAll('.reveal')` can find it. CSS modules would hash the class. The reduced-motion safety net in `globals.scss` already references `.reveal`, so this is the right neighbourhood.                                                                                                                           |
| How `<RevealRoot>` re-observes after route changes                        | Re-run the observer on `usePathname()` change. Use `useEffect` with `pathname` as a dep.                                                                                                          | App Router doesn't unmount the layout on client navigation. Without re-observing, the second page would not get its `.is-inview` class added.                                                                                                                                                                                                                                                                                       |
| Whether `<Reveal>` needs to be a client component                         | **No** — it's a server component that just writes `className="reveal"` (+ optional `data-delay`).                                                                                                 | The interactivity lives in `<RevealRoot>`. `<Reveal>` is markup-only. Keeps the client bundle smaller.                                                                                                                                                                                                                                                                                                                              |
| Mobile drawer focus management                                            | When the drawer opens, focus moves to the first link inside. Tab cycles within the drawer (manual focus trap on `keydown`). Escape closes and returns focus to the toggle. `<body>` scroll-locks. | Matches `accessibility.md`: "Mobile drawer must trap focus when open, return focus to the toggle on close, close on Escape, and not flicker the page underneath." No new dependency — focus trap is ~25 lines.                                                                                                                                                                                                                      |
| CustomCursor render mode                                                  | Always mounted as `<CustomCursor />` in `app/layout.tsx`. The component itself checks `matchMedia('(hover: hover) and (pointer: fine)')` on mount and bails out (renders `null`) if it fails.     | Mirrors the static template. SSR returns nothing; client decides per device. Touch users get zero markup and zero JS overhead beyond the matchMedia check.                                                                                                                                                                                                                                                                          |
| Custom cursor implementation                                              | Portal a `<div className="cursor" />` to `document.body` from the client component and drive its position with `requestAnimationFrame`. Hover detection via delegated `mouseover`/`mouseout`.     | Same shape as the static template. The mix-blend / accent dot is purely CSS.                                                                                                                                                                                                                                                                                                                                                        |
| Nav active state                                                          | `usePathname()` compared against each link's `href` with an exact match (`pathname === href`) for `/` and a `startsWith(href)` for the others.                                                    | Matches the source's "Index" / "Work" / "About" / "Contact" `is-current` behaviour. Case study pages (`/work/avsb`) should highlight the Work nav link.                                                                                                                                                                                                                                                                             |
| Where the SVG arrow lives                                                 | `<Arrow>` component, single source of truth                                                                                                                                                       | Source's static HTML has the same `<svg>` block repeated in ~12 places. Porting that verbatim would mean editing one arrow in twelve places when the design tweaks the stroke width.                                                                                                                                                                                                                                                |
| `<Tag>` styling                                                           | Inline-flex, mono caption, `4px 12px` padding, `999px` radius, 1px `--rule-strong` border, no background — neutral by default. Pages can override via `className` if they need a filled variant.  | The source `.case-block__tags > span` and `.service__tags > span` styles aren't perfectly identical to each other; building one shared base + letting pages add modifiers later is the smaller commitment.                                                                                                                                                                                                                          |
| `<MonoLabel>`                                                             | One component, prop `size = "default" \| "sm"`, renders `<span className="mono">` or `.mono-sm`. Default tag is `<span>` but `as` prop allows `<p>`, `<dt>`, etc.                                 | Trivial enough to be a no-op, but having the wrapper keeps the design system surface consistent and lets us swap the underlying class globally if we ever rename.                                                                                                                                                                                                                                                                   |
| Where `Section`, `SectionHead`, `Container`, `PageIntro`, `TickRule` live | One folder per component, flat file inside (no per-component SCSS — they read existing global classes from `_utils.scss` + `globals.scss`).                                                       | These are markup-only sugar. The styles already exist in the Phase 2 partials. A `_Section.module.scss` would just re-declare what `.section` already does. Following CLAUDE.md "trivial single-file components without styles: flat `.tsx` in the parent folder," but with a folder anyway for consistency with the other named primitives. Folder + flat file inside (`Section/Section.tsx`) so future style files can co-locate. |
| Default page intro `as` element                                           | `<h1>` for the title, `<header class="page-intro">` for the block.                                                                                                                                | Heading order rules (`accessibility.md`): one `<h1>` per page; `PageIntro` is the page-defining heading.                                                                                                                                                                                                                                                                                                                            |
| Where Nav and Footer come from in `app/layout.tsx`                        | Hardcoded with `siteConfig.navLinks` and `siteConfig.metaLinks` from `app/_lib/site-config.ts`. No props from page components.                                                                    | The chrome is universal. If a future case page wants to hide the nav (it doesn't, per the masterplan), we can address it then via composition.                                                                                                                                                                                                                                                                                      |
| Footer content                                                            | The default "Say hello — m.main2402@gmail.com" CTA, three meta links (GitHub / CV / Email), giant "Mainul" stroked wordmark, three-column legal line. Identical to `index.html:1297–1317`.        | Same on every page in the source. Header is a `<h2>`. Wordmark is `aria-hidden`.                                                                                                                                                                                                                                                                                                                                                    |
| CV link target                                                            | The Google Drive URL from the source, for now.                                                                                                                                                    | The masterplan tracks "self-host the CV" as a Phase 7 swap. We don't introduce a `/cv.pdf` until then; we keep the existing link working.                                                                                                                                                                                                                                                                                           |
| Touch device detection                                                    | We do not pre-bake "is-touch" into HTML. The CSS already hides `.cursor` on `(hover: none)` and shows the hamburger at ≤640px. JS only enables behaviours.                                        | No SSR hydration mismatch. No flash of "wrong" cursor.                                                                                                                                                                                                                                                                                                                                                                              |

## What's intentionally lighter than the masterplan suggests

- **No `RevealRoot` deduplication of already-observed nodes.** Re-observing a node that's already `is-inview` is a no-op — the observer fires once because `unobserve` is called on intersect. The cost of re-running `querySelectorAll('.reveal')` on every pathname change is negligible at our page sizes (<100 nodes).
- **No animation coordination between hero variant and nav-pulse.** Phase 4 owns the hero; this phase doesn't try to anticipate it.
- **Skip-link.** Conventionally a portfolio with a single hero column doesn't need a "Skip to main content" link, but accessibility says it's good practice. **Default proposal: ship a `.sr-only` skip link in `app/layout.tsx` that becomes visible on focus.** Cheap, accessibility-positive, and lets us cross it off the list before content lands. Flag if you'd rather skip it.

## What ships when this phase is done

- Every route (`/`, `/work`, `/about`, `/contact` — even though only `/` exists as a real page; the others return 404) shows the Nav on hover/desktop and the hamburger on phone. The Footer renders. The custom cursor follows the mouse on a real laptop and goes silent on touch. Tab order makes sense.
- Visiting `/` shows the cream background (already true from Phase 2) plus a fixed top nav with mono links, plus a full-bleed footer with the stroked "Mainul" wordmark.
- The page body is still effectively empty (the Phase 1 placeholder) but wrapped in `<Container>` + `<Section>` so we can see the spacing rhythm is on-brand.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` are all clean.
- Lighthouse a11y on `/` reads ≥95.
- The masterplan's note that "Nav + Footer pass keyboard + screen-reader" is verifiably true.

## What we're not changing

- `next.config.ts` — already correct.
- The five `_styles/` partials from Phase 2 — except for appending `.reveal` rules to `globals.scss`.
- `mdx-components.tsx` — that's Phase 6.
- `app/page.tsx` keeps its placeholder body content (now inside `<Container>` + `<Section>`), but only as a smoke-test for the chrome.

## Out of scope (deferred to later phases)

- Home-page content (Phase 4) — `Hero`, `HeroVariantA/B`, `HeroBadge`, `Marquee`, `Intro`, `Stats`, `Services`, `SelectedWork`, `SelectedClients`, `Recognition`, `Experience`, `EndCTA`, `TweaksPanel`.
- About + Contact pages (Phase 5).
- Work index + 3 case studies (Phase 6).
- Self-hosted favicon (`futureWorks.md`).
- Self-hosted CV PDF (Phase 7).
- Self-hosted portrait (Phase 5).
- Form backend + Resend wiring (Phase 5).

## Risk

Low–medium.

- **Low:** the eleven small primitives (Arrow, Container, Section, SectionHead, PageIntro, Button, TextLink, TickRule, MonoLabel, Tag, Reveal) are markup over already-ported global classes. The blast radius is one or two prop typos.
- **Medium:** the four interactive pieces (Nav drawer, Reveal observer, CustomCursor, scroll-state).
  - Nav drawer focus trap has a long history of being subtly wrong on iOS; we're keeping it simple (no `<dialog>` API, no library) and verifying with VoiceOver before calling it done.
  - The custom cursor occasionally lags on first render because `requestAnimationFrame` starts before the first `mousemove`. Initialising `cx, cy` to viewport-centre and only painting after the first move (`opacity: 0 → 1` after first event) avoids the "ghost dot in the corner" pattern. Already in the static template.
  - The reveal observer must clean up on unmount (`io.disconnect()` in the effect cleanup). Otherwise a route change leaks observers.

## Verify

1. `npm run dev` — `/` shows nav + footer + still-empty body; chrome doesn't shift on scroll.
2. Tab through `/`: focus moves logo → nav links → main content → footer links. Visible focus state.
3. Resize to ≤640px: hamburger appears, nav links hide, tap hamburger → drawer slides down, Tab cycles inside the drawer, Escape closes, focus returns to the hamburger.
4. Hover any link on a desktop with a fine pointer: custom cursor expands to a 56px transparent ring.
5. On a touch device (or with DevTools "Touch" simulation): no cursor, hamburger visible, drawer works on tap.
6. `prefers-reduced-motion: reduce` in DevTools: nav-pulse stops, drawer opens without translate animation, cursor still works (movement is essential, not decorative).
7. Scroll the page: `nav.scrolled` toggles on/off at the 30px threshold; backdrop blur appears.
8. Manually add `<Reveal data-delay="2"><div>foo</div></Reveal>` to the placeholder home page and confirm it animates in on scroll, then revert.
9. Visit `/work`, `/about`, `/contact` (these return Next's 404 page) and confirm the nav active state computes correctly — Work/About/Contact are technically still navigable, the placeholders being 404 is OK for this phase.
10. Lighthouse a11y audit on `/` → ≥95.

## Exit criteria

- All fifteen component files exist under `app/_components/` per the file conventions (folder per named component, flat file inside; SCSS module co-located when the component has its own styles).
- `app/layout.tsx` renders `<RevealRoot> + <CustomCursor> + <Nav> + {children} + <Footer>` (with a `.sr-only` skip link above the nav).
- `app/_lib/site-config.ts` exists and is the only place the nav links, social links, owner email, and footer copy are defined.
- `globals.scss` contains the `.reveal` opacity/transform rules + the five `data-delay` steps.
- `npm run build`, `npx tsc --noEmit`, and `npm run lint` all clean.
- Lighthouse a11y on `/` ≥95.
- One smoke-test pass with VoiceOver on the Nav drawer (open → tab → close).
- `futureWorks.md` updated with any single-line gap (e.g. focus-trap simplification, self-hosted CV deferral, screen-reader pass scope).
