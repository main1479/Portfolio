# Coding style

Auto-loaded for every task. Keep these in mind without being asked.

## TypeScript

- Strict mode is on. `any` requires a comment justifying it.
- Prefer `unknown` over `any` and narrow with type guards.
- Don't export types from component files via `index.ts` — import from the explicit file path.
- One file per public type domain (`app/_types/work.ts`, `app/_types/experiment.ts`).
- Derive TS types from Zod schemas with `z.infer<>` rather than hand-keeping two definitions in sync.

## React + Next.js

- **Server components by default.** Only add `'use client'` when the component needs:
  - Event handlers (`onClick`, `onChange`, etc.)
  - State (`useState`, `useReducer`)
  - Effects (`useEffect`, `useLayoutEffect`)
  - Browser APIs (`window`, `document`, `localStorage`)
- Keep client components leaf-shaped. A client component should not render server components.
- Use `next/image` for every raster image, with explicit `width`/`height` or `fill` + a sized parent.
- Use `next/font` for fonts. No raw `<link>` to Google Fonts.
- Route handlers (`app/**/route.ts`) stay thin — call into `app/_lib/*` for any logic past parsing input.

## SCSS modules

- **SCSS modules only.** No inline `style={{}}`. No CSS-in-JS. No global class names in components.
- Global tokens live in `app/_styles/`: `_variables.scss`, `_mixins.scss`, `_typography.scss`, `_utils.scss`, `globals.scss`.
- Variables and mixins are auto-imported into every component module via `next.config.ts` `additionalData` — **do not manually `@use` them in component SCSS**.
- Sass files that depend on variables (e.g. `_mixins.scss`, `_typography.scss`) must have their own `@use 'variables' as *` at the top.
- Always `@use`, never `@import`. `@import` is deprecated in Dart Sass.
- Class names in SCSS modules use camelCase: `.cardWrapper`, `.primaryButton`.
- SCSS module files use the underscore prefix: `_Button.module.scss`, `_homePage.module.scss`.
- If a value (color, spacing, radius) feels like it should be a token, promote it to `_variables.scss` rather than repeating the literal.

## Naming

- Components: `PascalCase.tsx`. Hooks: `useThing.ts`. Utils: `kebab-case.ts` or `camelCase.ts` (pick one and stay consistent).
- Folder == component name when the component has co-located files. Flat file otherwise.
- Underscore-prefixed folders inside `app/` (`_components`, `_lib`, etc.) so App Router ignores them as routes.
- Underscore-prefixed SCSS module files (`_Button.module.scss`) to match the partial-file convention.

## What not to do

- No `index.ts` / `index.tsx` re-export files.
- No console.log left in committed code (intentional logging gets a comment explaining it).
- No `// @ts-ignore` or `// @ts-expect-error` without a comment.
- No premature abstractions. Three usages before extracting a shared helper.
- No new dependencies without running `/audit-deps` first.
- No `@import` in SCSS.
