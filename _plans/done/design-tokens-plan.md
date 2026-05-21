# Plan — Design tokens & shared SCSS partials (Phase 2)

**Status:** Draft — awaiting approval
**Date:** 2026-05-21
**Branch (when created):** `feature/design-tokens`
**Masterplan reference:** `docs/MASTERPLAN.md` §3 (design system), §9 (responsive strategy), §10 (Phase 2)

---

## What

Fill in the five TODO skeletons under `app/_styles/` so that every component module written from Phase 3 onward can read the same set of design tokens, type rules, and layout primitives through Next.js's `additionalData` auto-import. After this phase, no component SCSS module will ever need to define a colour, a spacing value, a typography clamp, or an animation keyframe of its own — it can just reach for the token.

The five partials and what each one owns:

1. **`_variables.scss`** — the canonical `:root` custom properties (colour, type families, layout sizes, easing curves) plus matching SCSS-scope variables for the breakpoint widths that live inside `@media` queries (so they can be referenced in expressions, not just CSS).
2. **`_mixins.scss`** — reusable Sass mixins: `container`, `fluid-type`, `section-y`, and a `prefers-reduced-motion` guard mixin. Keyframes themselves live in `globals.scss` (see "Decisions" below).
3. **`_typography.scss`** — `.mono`, `.mono-sm`, `.display` plus the five size classes (`-xl`, `-lg`, `-md`, `-sm`, `-xs`), the `.outline` stroked variant, `.lede`, paragraph base + `p.large`. Includes every breakpoint clamp-down from `shared.css` (1100px, 900px, 640px, 380px).
4. **`_utils.scss`** — `.container`, `.container--narrow`, `.section`, `.section__head`, `.section__index`, `.section__title`, `.sr-only`, `.tick-rule` (with its decorative marks).
5. **`globals.scss`** — the existing reset + body + selection rules get filled out properly: tokenised body background and colour, `text-wrap: pretty`, `scroll-behavior: smooth`, `::selection`, image/anchor/button defaults, the `.page-intro` block, and the named keyframes (`rise`, `fade-in`, `nav-pulse`, `spin`, `marquee`, `scroll-bar`) emitted exactly once.

## Why

The scaffold (Phase 1) wired the SCSS plumbing — `next.config.ts` injects `@use 'variables' as *; @use 'mixins' as *;` into every component module, the partials exist as TODO files, the three fonts load through `next/font`, the `1rem = 10px` convention is set on `html`. What's missing is the actual content of those partials. Until they're filled in, no real UI can be built — every component module would either have to define its own tokens (which violates `CLAUDE.md` line 152) or hard-code literal values (which violates the "promote it to `_variables.scss`" rule).

Phase 2 also turns the still-placeholder home page into something visually distinguishable from default Next.js styling. Even though `app/page.tsx` stays as-is (per the instruction — the real home page is Phase 4), the body will pick up the cream background, Josefin Sans body type, and the new selection colour, which is the first visible "this is the portfolio" signal in `npm run dev`.

## Why now (not later)

Phase 3 (layout shell — Nav, Footer, CustomCursor, Reveal) is the next phase and it cannot start until the tokens exist. Every component in Phase 3 references multiple tokens (`var(--accent)`, `var(--gutter)`, `var(--section-y)`, `var(--ease-out)`, the `.mono` caption style, the `.container` layout primitive). Doing it before Phase 3 also means we hit any auto-import wrinkles once, in a small contained PR, instead of debugging them while also writing Nav markup.

## Scope guard

This phase **only** touches the five files in `app/_styles/`. It does **not**:

- Build any components (Phase 3+).
- Change `app/page.tsx` (Phase 4 owns the home page).
- Add any new dependency.
- Add CSS for nav, footer, hero, buttons, tweaks panel, custom cursor, marquee, or any component-specific styles — those live in their own component module in their own phase.
- Touch `next.config.ts`, `app/layout.tsx`, `mdx-components.tsx`, or any other infra file. The plumbing is right; we're just filling the pipes.

If a value belongs on a component (e.g. nav padding, button radius, marquee speed), it does **not** land here — it lands in that component's SCSS module in its phase.

## Decisions I'm making (call them out below if you'd change any)

| Decision                                                                                            | Default                                                                                                                                                                                                                | Why                                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Where keyframes live                                                                                | `globals.scss` (top-level), **not** `_mixins.scss`                                                                                                                                                                     | `_mixins.scss` is auto-imported into _every_ component module via `additionalData`. Putting keyframes inside it would re-emit them in every compiled component CSS bundle. `globals.scss` imports exactly once.  |
| `_mixins.scss` content                                                                              | Sass `@mixin` definitions only — no rule sets, no keyframes                                                                                                                                                            | Same reason as above. Mixins are inert until `@include`d, so multiple imports are safe.                                                                                                                          |
| `prefers-reduced-motion` strategy                                                                   | One `reduced-motion-safe` mixin you wrap motion-bearing rules in, plus a global override at the end of `globals.scss` that kills the named animations (`marquee`, `spin`, `nav-pulse`, `rise`, `scroll-bar`, reveal).  | Per `accessibility.md` and masterplan §3.4 — non-essential motion must respect the OS preference. A mixin lets component modules opt in; the global override is the safety net that catches anything we forget. |
| Outline stroke width                                                                                | Keep `1.2px var(--fg)` for `.outline` (masterplan §3.7 default). Footer wordmark uses `1.5px` inline (it's in `Footer.module.scss`'s job in Phase 3, not ours).                                                         | Matches `shared.css:106` exactly.                                                                                                                                                                                |
| Phone breakpoint behaviour at 320px                                                                 | Honour the masterplan §9 guardrail — `--gutter` floor of 16px at ≤320px, display-xl floor that does not overflow at 320px (`clamp(2.6rem, 10vw, …)`), tick-rule + sr-only unaffected.                                  | The masterplan promises 320px is the hard QA baseline; we have to ship that floor here or it won't get added later when components have already hard-coded.                                                      |
| Whether to add `.visually-hidden` _and_ `.sr-only`                                                  | Just `.sr-only` (the masterplan and source CSS use that name)                                                                                                                                                          | The TODO comment in the current `_utils.scss` says `.visually-hidden` but `shared.css:430` is `.sr-only`. We follow the source.                                                                                  |
| Whether to define `.reveal` / `.is-inview` here                                                     | **Defer to Phase 3**. The class is component-coupled (it's mounted by a `<RevealRoot>` IntersectionObserver) and the rule belongs with that component, not in the global token layer.                                  | The TODO comment in `_utils.scss` lists it but the masterplan §10 Phase 3 file list shows it landing with `Reveal/RevealRoot`. Phase 2 is tokens, not behaviours.                                                 |
| Tweaks-panel-only tokens (e.g. `mn-accent-v2` localStorage key, accent preset array)                | Out of scope — those land in `app/_lib/site-config.ts` and `TweaksPanel/TweaksPanel.tsx` (Phase 4)                                                                                                                     | Tokens here are the design language. Preset arrays are content/state, not styling.                                                                                                                               |

## What ships when this phase is done

- A dev server (`npm run dev`) loads the home page on a cream background (`#f5f0ec`) with Josefin Sans body type, the navy accent visible if you select text.
- `npx tsc --noEmit` is clean (no TS surface changed but we re-run for completeness).
- `npm run lint` is clean.
- `npm run build` succeeds.
- Any future component module can write rules like `padding: 0 var(--gutter);`, `font-family: var(--font-mono);`, `transition: opacity 0.5s var(--ease-out);`, or `@include fluid-type(1.5rem, 2.4rem, 320px, 1640px);` without any extra imports.

## What we're not changing

- Font loading in `app/layout.tsx` (already set up).
- The Sass loader config in `next.config.ts` (already set up; we're filling the partials it already imports).
- The placeholder `app/page.tsx` (Phase 4 owns it).
- The MDX setup or `mdx-components.tsx` (Phase 6 extends it).

## Out of scope

- Any component CSS (button, nav, footer, marquee, hero — all Phases 3+).
- Dark mode (masterplan non-goal for v1).
- Container queries (masterplan §9 explicitly defers them; width-based queries match the source).
- A token-documentation page or Storybook (not on the roadmap).

## Open questions

None I can think of. The source CSS is unambiguous about every token, every clamp, every breakpoint. The only real decision was "where do keyframes live" (answered above).

## Risk

Very low. All five files are tokens-only — no behaviour, no markup, no TypeScript. The worst-case regression is a typo that breaks the Sass build, which `npm run build` catches in seconds. If the partials misbehave at `additionalData`-injection time, the dev server's Sass error will name the file and line. No production deploy is gated on this — Vercel only deploys merges to `main` and we won't merge anything until you've signed off.

## Verify

1. `npm run dev` boots, `/` renders on cream background with Josefin body type.
2. `npm run build` succeeds.
3. `npx tsc --noEmit` is clean.
4. `npm run lint` is clean.
5. Manually shrink the viewport from 1640px down to 320px in DevTools; nothing overflows, the placeholder text reflows cleanly, `.sr-only` content stays invisible.
6. Toggle "Emulate CSS prefers-reduced-motion: reduce" in DevTools; the body still renders (no animations to disable yet, but the override block doesn't break anything).

## Exit criteria

- Every `:root` token from `shared.css` exists in `_variables.scss`.
- Every responsive token override (≤1100, ≤900, ≤640, ≤380) is preserved.
- Every named keyframe from the masterplan §3.4 list is declared once in `globals.scss`.
- `.mono`, `.mono-sm`, `.display`, the five `.display-*` sizes, `.outline`, `.lede`, `p`, `p.large` all read identically to the source for screen widths between 320px and 1920px.
- `.container`, `.container--narrow`, `.section`, `.section__head`, `.section__index`, `.section__title`, `.sr-only`, `.tick-rule` all render identically to the source when dropped into a one-off test page.
- Build is green; dev server renders; futureWorks gets at most one line for anything that genuinely deferred (e.g. if a clamp ends up needing a one-off tweak we want to revisit later).
