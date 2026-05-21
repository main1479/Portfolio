---
description: Pre-flight check before committing or deploying — typecheck, lint, build, and a manual visual reminder.
---

Run the pre-ship gauntlet for this portfolio site. **Do not commit, push, or deploy** — just verify the change is shippable.

Steps (run in this order, stop on first failure):

1. **Status check.** `git status` — what's about to ship?
2. **Type check.** `npm run typecheck` (or `npx tsc --noEmit` / `npx astro check` depending on framework). Report failures verbatim.
3. **Lint.** `npm run lint`. Report failures verbatim.
4. **Build.** `npm run build`. Capture any warnings, not just errors.
5. **Bundle sanity** (Next.js only): glance at the build output for any chunk > 250KB gzipped; flag if so.
6. **Visual check reminder.** Print: "⚠️ Type/lint/build pass ≠ visual correctness. Run `npm run dev` and manually verify the change in the browser before deploying."

If a step is missing (e.g., no `typecheck` script yet), skip it and note that the project hasn't wired that step up.

Output a single ship-readiness verdict at the end: `READY` / `BLOCKED — <reason>` / `INCOMPLETE — <missing step>`.
