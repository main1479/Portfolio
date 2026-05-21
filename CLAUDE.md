# Portfolio — Project Rules for Claude

This file is read automatically on every task. Follow all rules below without being asked.

---

## Project overview

Personal portfolio website for Mainul Islam — frontend developer specialising in A/B testing and experimentation. Built to showcase case studies (experiment design, hypothesis → variant → result), selected client work, and a contact path. Greenfield as of 2026-05-21.

**Key technologies:** Next.js 16 (App Router), React 19, TypeScript (strict), SCSS modules (Dart Sass), deployed to Vercel.

This is a **small, single-developer site**. Many of the rules below are deliberately lighter than they would be on a production app. Where rigor exists, it's there to train the discipline — not because the site needs it.

---

## Project structure

```
/
├── app/                        ← Next.js App Router
│   ├── layout.tsx              ← Root layout
│   ├── page.tsx                ← Landing page (hero, selected work, contact CTA)
│   ├── _components/            ← Universal UI primitives (Button, Card, Tag, etc.)
│   ├── _lib/                   ← Utilities, validators, formatters
│   ├── _styles/                ← Global SCSS: _variables, _mixins, _typography, _utils, globals
│   ├── _types/                 ← Shared TypeScript types
│   │
│   ├── work/                   ← /work — case study index + [slug] detail pages
│   ├── about/                  ← /about
│   └── contact/                ← /contact (form + email link)
│
├── public/                     ← Static assets (images, OG cards, favicon)
│
├── _plans/                     ← Non-technical plans (plain English)
├── _specs/                     ← Technical specs (files, components, edge cases)
│
├── .claude/                    ← Claude Code configuration
│   ├── rules/                  ← Modular rules (auto-loaded)
│   ├── skills/                 ← Project-specific skills
│   ├── agents/                 ← Sub-agents (code-reviewer, security-reviewer)
│   ├── commands/               ← Slash commands (/review, /ship, /audit-deps)
│   ├── hooks/                  ← Pre/post tool-use hooks
│   ├── settings.json           ← Project policy: hook registration + base allow/deny permissions (committed)
│   └── settings.local.json     ← Personal per-machine overrides (gitignored; managed by Claude Code's auto-recorder — don't hand-edit)
│
├── futureWorks.md              ← Running list of deferred work / known gaps
├── next.config.ts
├── tsconfig.json
└── package.json
```

The legacy static-HTML draft lives under `Mainul's Portfolio/` and is **read-only reference**. Do not edit it; port content as needed when building the real `app/` tree.

---

## Critical rules — never violate these

1. **Never commit to `main`** — always use feature branches (`feature/...`, `fix/...`, `chore/...`).
2. **Never skip the plan → spec → approve → implement workflow** for any code change.
3. **Never use `any`** unless absolutely unavoidable, and only with a comment explaining why.
4. **Never use inline styles.** SCSS modules only — no `style={{}}` props, no CSS-in-JS.
5. **Never use `@import` in SCSS** — use `@use` (Dart Sass; `@import` is deprecated).
6. **Never manually import variables/mixins in component SCSS modules (`*.module.scss`)** — they're auto-imported via `next.config.ts`. (Sass partials in `app/_styles/` still need their own `@use 'variables' as *`.)
7. **Never create `index.ts` / `index.tsx` files.** No barrel exports.
8. **Never hardcode secrets.** Use environment variables (`process.env.*`) via `.env.local` (gitignored).
9. **Never install a dependency without asking first.** Static sites accumulate npm bloat fast — see `/audit-deps`.
10. **Never add analytics, tracking pixels, or third-party widgets** without explicit sign-off.
11. **Always validate user-supplied input with Zod** before doing anything with it (contact form, query params).
12. **Always push to GitHub after every meaningful change** — plans, specs, and every implementation commit.
13. **Always log gaps to `futureWorks.md`** after a task — anything deferred, preexisting issue uncovered, or shipped-partial gets a one-line entry.

---

## Workflow — always in this order

Every task that involves changing, adding, or removing code follows this sequence:

1. **Non-technical plan** — Plain-English summary of what's being built and why. Suitable for a stakeholder to skim and approve. Save to `_plans/<feature>-plan.md`. **Commit and push immediately.**
2. **Wait for approval.** Do not proceed until I confirm.
3. **Technical spec** — Detailed breakdown: files to create/edit, components, routes, types, edge cases, accessibility considerations. Save to `_specs/<feature>-spec.md`. Filename matches the plan. **Commit and push immediately.**
4. **Wait for approval.** Do not proceed until I confirm.
5. **Branch** — Name by type and feature: `feature/case-study-shell`, `fix/contact-form-validation`, `chore/upgrade-next`.
6. **Implement** — Follow the spec. For tasks touching >3 files or multiple concerns, use sub-agents (see below). **Commit and push after each logical unit.**
7. **Verify** — Run `/ship` (typecheck + lint + build). Manually verify the change in `npm run dev`. Fix any failures.
8. **Push final state to GitHub.**
9. **Summary** — Report what was built, branch name, anything left to do.
10. **Retrospective** — If the plan or spec was wrong in any way, append a `## Retrospective` section to the spec noting what was off.
11. **`futureWorks.md`** — One-line entry per deferred item, preexisting issue uncovered, or knowingly-partial behaviour. Format: `- [<area>] <description> — <branch or session ref>`. Commit + push.

For trivial single-file changes (typo fix, copy tweak, image swap), the plan and spec can be combined into a single short note in `_plans/`. Use judgment — but err toward writing it down.

---

## File & folder conventions

### Components

- Any component with its own styles: named folder. `Button/Button.tsx` + `Button/_Button.module.scss` co-located.
- Sub-components that only live inside a parent: flat `.tsx` file in the same folder, no SCSS file of their own.
- Trivial single-file components without styles: flat `.tsx` in the parent folder.
- **No `index.ts` re-export files.** Import from the explicit path.

### Pages

- Simple pages: `page.tsx` + `_pageName.module.scss` flat in the route folder.
- Pages with sub-components: same, plus a `_components/` subfolder.

### Underscore prefix

- All non-route folders inside `app/` use an underscore prefix: `_components`, `_lib`, `_styles`, `_types`. This keeps the App Router from treating them as routes.
- SCSS module files use underscore prefix: `_homePage.module.scss`, `_Button.module.scss`.

### File size

- Keep components under 250 lines. If a component grows past that, split it. Pages can be longer if they're mostly composition.

---

## TypeScript rules

- Strict mode is on. No `any` without a comment justifying it.
- All shared types live in `app/_types/` — one file per domain (`work.ts`, `experiment.ts`, etc.).
- Define API/component prop types **before** writing the implementation.
- Prefer `unknown` over `any`; narrow with type guards.
- Use Zod for runtime validation; derive TS types from Zod schemas with `z.infer<>` when possible.

---

## Styling rules (SCSS modules)

- **SCSS modules only.** No inline `style={{}}` props. No CSS-in-JS. No global class names in components.
- Global tokens live in `app/_styles/`: `_variables.scss`, `_mixins.scss`, `_typography.scss`, `_utils.scss`, `globals.scss`.
- Variables and mixins are auto-imported into every component module via `next.config.ts` `additionalData` using `@use` — **do not manually import them in component SCSS**.
- Sass files that depend on variables (e.g. `_mixins.scss`, `_typography.scss`) must have their own `@use 'variables' as *` at the top.
- Use `@use` instead of `@import`. `@import` is deprecated in Dart Sass.
- Class names in SCSS modules use camelCase: `.cardWrapper`, `.primaryButton`.
- SCSS module files use the underscore prefix: `_Button.module.scss`, `_homePage.module.scss`.
- Dark mode (if added): use a `data-theme` attribute on `<html>` swapped via React, with `:root[data-theme='dark']` selectors in `globals.scss`.

---

## Next.js rules

- **Server components by default.** Add `'use client'` only when the component needs interactivity, browser APIs, or React hooks that require it.
- Use `next/image` for every raster image. Never use raw `<img>` for content images.
- Use `next/font` for any web fonts. No `<link>` tags to Google Fonts.
- Route handlers (`route.ts`) should be thin. Business logic goes in `app/_lib/*` service functions.
- `NextResponse.json({ success: true, data })` / `{ success: false, error }` envelope for all API responses.

---

## Accessibility (non-negotiable for a portfolio)

- Semantic HTML first. `<button>` for actions, `<a>` for navigation. ARIA only when no native element fits.
- Every image gets a meaningful `alt`. Decorative images use `alt=""`.
- Keyboard navigation works for every interactive element. Visible focus state (don't just use the browser default — design it).
- Color contrast meets WCAG AA (4.5:1 for body text, 3:1 for large text and UI components).
- Forms have labels — visible by default, `aria-label` only when visual design genuinely can't fit one.
- Heading order doesn't skip levels.

See `.claude/rules/accessibility.md` for the deeper checklist.

---

## Git rules

- Never commit directly to `main`.
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`.
- Commit messages: imperative, lowercase, specific — `add case study card to work index`.
- **Push after every plan, spec, and implementation commit.** No work stays local.
- Before committing, scan for: `console.log`, `debugger`, hardcoded secrets, TODO/FIXME without an owner.

---

## Plans and specs

- `_plans/` — non-technical plans (plain English, stakeholder-readable).
- `_specs/` — technical specs (files, components, types, edge cases).
- `_plans/done/` and `_specs/done/` — completed work (move after a feature ships, **only with my explicit OK**).
- Filenames must match: `case-study-shell-plan.md` ↔ `case-study-shell-spec.md`.

---

## Sub-agents

For any task touching more than 3 files or more than one concern (UI + API + types), invoke sub-agents:

- **`code-reviewer`** — runs before commit. Punch list, not rewrite. See `.claude/agents/code-reviewer.md`.
- **`security-reviewer`** — runs before adding deps or opening forms. See `.claude/agents/security-reviewer.md`.

Sub-agents are read-only by default. They report; I (or you, on my OK) apply fixes.

### Model selection

- **Haiku** — file exploration, content reading, simple search, doc edits.
- **Sonnet** — multi-file changes, component building, route handlers, most implementation work (default).
- **Opus** — architecture decisions, debugging multi-file failures, anything that's failed once already.

---

## Slash commands

All in `.claude/commands/`:

- **`/review`** — runs the `code-reviewer` sub-agent on the current diff.
- **`/ship`** — pre-flight gauntlet (typecheck + lint + build + visual-check reminder). Does NOT commit, push, or deploy.
- **`/audit-deps`** — supply-chain audit of installed deps, or vet a candidate before adding it.
- **`/finish-feature`** — end-of-feature ceremony: runs `/ship`, moves plan/spec to `done/`, opens PR, pauses for explicit confirm, squash-merges to `main`, deletes branch, syncs local, prompts for `futureWorks.md` additions. Pauses before the irreversible step.

---

## Verification checklist (run before marking any task complete)

1. `npm run build` passes with no errors.
2. `npx tsc --noEmit` is clean.
3. `npm run lint` is clean.
4. No `console.log` left in committed code (intentional logging is fine — comment it).
5. No hardcoded secrets.
6. New files follow naming conventions (no `index.ts`, underscore prefix for non-routes, etc.).
7. UI changes verified visually in `npm run dev`.
8. Changes are on a feature branch.
9. All changes committed AND pushed.
10. `futureWorks.md` updated if anything was deferred.

---

## Commands reference

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest (if/when tests exist)
```

> Some of these scripts don't exist yet because the Next.js project hasn't been scaffolded. Once `npm create next-app@latest` runs and these are wired up, this section is authoritative.

---

## What I don't want

- No analytics scripts, tracking pixels, or third-party widgets without explicit sign-off.
- No CI workflows yet — keep things local until the site has real shape.
- No `README.md` filler. The README is written when the site is ready to launch.
- No premature abstractions. Three usages before extracting a shared helper.
