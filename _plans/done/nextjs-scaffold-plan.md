# Plan + Spec — `chore/nextjs-scaffold`

> Combined plan + spec per `CLAUDE.md:91`. Bounded mechanical bootstrap work like `chore/repo-init`, just with more files.

**Status:** Implemented (pending PR + squash-merge via `/finish-feature` after CC restart)
**Date:** 2026-05-21
**Branch:** `chore/nextjs-scaffold`

---

## What

Stand up an empty-but-working Next.js project inside this repo, wired to the conventions in `CLAUDE.md`:

- Next.js (latest stable, App Router), React 19, TypeScript strict.
- SCSS Modules (Dart Sass) with global tokens auto-imported via `next.config.ts` `additionalData`.
- MDX for case studies (`@next/mdx`).
- `next/font/google` self-hosting Teko, Josefin Sans, JetBrains Mono.
- ESLint + Prettier configured.
- No Tailwind, no Framer Motion, no shadcn — confirmed earlier in this session.
- No real UI yet — `app/page.tsx` is a placeholder that says "scaffolded." Porting the design template is Phase 2.

This is the first feature merge that exercises the **full workflow end-to-end** (branch → plan → spec → implement → /ship → /finish-feature → squash-merge → main sync). It's the verification milestone for the workflow itself.

## Why

After `chore/repo-init`, the next blocker is: there's no `package.json`, no `next dev`, no `npm run build`. Every subsequent plan assumes those exist. The scaffold has to land before any porting work can begin.

## Decisions I'm making (override these in your approval)

| Decision                                      | Default                                                                                                              | Why                                                                                                                                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **How to scaffold given the dir isn't empty** | **Scaffold in a sibling temp dir, then copy artifacts into this repo**                                               | `create-next-app` won't run cleanly in a populated directory. Sibling scaffold + selective copy is the lowest-risk path — our `.claude/`, `CLAUDE.md`, `_plans/`, `_specs/`, `futureWorks.md` are never touched |
| **Next.js version**                           | **Whatever `create-next-app@latest` installs**                                                                       | `CLAUDE.md` says 16; if `latest` resolves to 15.x we accept that and note it in the retrospective                                                                                                               |
| **Package manager**                           | **npm**                                                                                                              | Consistent with everything we've done so far. No Yarn/pnpm/bun churn                                                                                                                                            |
| **Turbopack for `dev`**                       | **Yes** (Next.js default in current CLI)                                                                             | Faster dev loop; accept whatever `create-next-app` defaults                                                                                                                                                     |
| **`--no-tailwind`**                           | **Yes**                                                                                                              | Decided earlier in this session                                                                                                                                                                                 |
| **`--no-src-dir`**                            | **Yes**                                                                                                              | `CLAUDE.md` puts `app/` at repo root                                                                                                                                                                            |
| **App Router**                                | **Yes**                                                                                                              | `CLAUDE.md`                                                                                                                                                                                                     |
| **Import alias**                              | **`@/*`**                                                                                                            | Standard                                                                                                                                                                                                        |
| **ESLint**                                    | **Yes**                                                                                                              | `CLAUDE.md` workflow assumes `npm run lint` exists                                                                                                                                                              |
| **Generated boilerplate to delete**           | **`README.md`, `public/*.svg` defaults, `app/page.module.css` (we use SCSS), `app/favicon.ico` we'll replace later** | `CLAUDE.md:246` — "No README.md filler"                                                                                                                                                                         |
| **Where the design tokens land**              | **`app/_styles/_variables.scss`** + `_mixins.scss` + `_typography.scss` + `_utils.scss` + `globals.scss`             | `CLAUDE.md:133`                                                                                                                                                                                                 |
| **`next.config.ts`**                          | **`.ts` not `.mjs`**                                                                                                 | `CLAUDE.md:48` says `next.config.ts`                                                                                                                                                                            |
| **Auto-import via `additionalData`**          | **`@use 'app/_styles/variables' as *; @use 'app/_styles/mixins' as *;`**                                             | `CLAUDE.md:134`                                                                                                                                                                                                 |
| **Fonts**                                     | **`next/font/google`**, weights pulled from what the static template actually uses                                   | The template loads Teko 300–700, Josefin Sans 300–600, JetBrains Mono 400–600 — subset accordingly                                                                                                              |
| **Prettier config**                           | **Single quotes, no semicolons? Or semicolons + double quotes?**                                                     | **Open question — see below**                                                                                                                                                                                   |
| **Run sub-agents at end**                     | **`code-reviewer` on the diff before `/finish-feature`**                                                             | The diff is multi-file; this is what the agent is for                                                                                                                                                           |

## Open questions (need a direct answer in your approval)

1. **Prettier preferences.** Pick one: (a) defaults (semicolons, double quotes), (b) single quotes + no semicolons + trailing commas, (c) something else. The static template uses double quotes; doesn't strongly imply a preference.
2. **ESLint extras.** Add `eslint-plugin-jsx-a11y` now, or wait until we have JSX surface to lint? Accessibility is non-negotiable per `CLAUDE.md:154`; my recommendation is **add it now** so the rules are alive from line 1.
3. **`app/favicon.ico`** — keep the Next.js default (the N logo) for now, or remove and add `futureWorks` entry to add a real one? Recommendation: **remove**, leave a `futureWorks` entry.

## Approach: sibling scaffold + selective copy

1. From `~/Desktop/Practice_Projects/`, run `create-next-app` into a sibling directory (`portfolio-scaffold/`).
2. Inspect what was generated.
3. Copy the files we want into this repo (`package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, ESLint config, `next-env.d.ts`, `app/`, `public/`).
4. **Merge** the generated `.gitignore` additions into ours (don't overwrite — we already have Next.js entries in ours from the earlier scaffold).
5. Delete the temp sibling dir.
6. Install our extra deps (`sass`, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `prettier`, optionally `eslint-plugin-jsx-a11y`).
7. Rewrite `next.config.ts`, replace `app/page.tsx`, drop `app/page.module.css`, add `app/_styles/` skeleton.
8. Verify with `dev` + `build` + `tsc` + `lint`.

---

## Step-by-step procedure

### Phase A — Branch + sibling scaffold

```bash
git checkout -b chore/nextjs-scaffold
cd ..
npx create-next-app@latest portfolio-scaffold \
  --typescript --eslint --no-tailwind --no-src-dir --app \
  --import-alias "@/*" --use-npm --yes
```

If `create-next-app` prompts (newer CLI may ask about Turbopack regardless of `--yes`), accept defaults.

### Phase B — Copy generated artifacts into this repo

From inside our repo (`~/Desktop/Practice_Projects/Portfolio`):

```bash
SCAFFOLD=../portfolio-scaffold
cp "$SCAFFOLD"/package.json .
cp "$SCAFFOLD"/package-lock.json .
cp "$SCAFFOLD"/tsconfig.json .
cp "$SCAFFOLD"/next-env.d.ts .
cp "$SCAFFOLD"/next.config.* .          # whichever extension was generated
cp "$SCAFFOLD"/eslint.config.mjs . 2>/dev/null || cp "$SCAFFOLD"/.eslintrc.json . 2>/dev/null
cp -r "$SCAFFOLD"/app .
cp -r "$SCAFFOLD"/public .
```

Merge the generated `.gitignore` into ours — append only entries not already present (`/.next/`, `/.vercel`, etc. are probably already there).

Delete artifacts we don't want:

```bash
rm -f README.md                       # CLAUDE.md:246 — no README filler
rm -f public/next.svg public/vercel.svg public/file.svg public/window.svg public/globe.svg
rm -f app/favicon.ico                 # placeholder N logo; futureWorks entry to add a real one
rm -f app/page.module.css             # we use SCSS modules, not the default CSS module
```

Tear down the temp dir:

```bash
rm -rf "$SCAFFOLD"
```

### Phase C — Install our extra dependencies

```bash
npm install -D sass prettier
npm install -D @next/mdx @mdx-js/loader @mdx-js/react @types/mdx
npm install -D eslint-plugin-jsx-a11y     # if open-question #2 answered yes
```

### Phase D — Configure (`next.config.ts`, Prettier, scripts)

**`next.config.ts`** — overwrite the generated minimal version with:

```ts
import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  sassOptions: {
    additionalData: `@use 'app/_styles/variables' as *; @use 'app/_styles/mixins' as *;`,
  },
};

export default withMDX(nextConfig);
```

**`mdx-components.tsx`** at repo root (required by App Router for MDX):

```tsx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
```

**`.prettierrc`** — choice pending open-question #1.

**`.prettierignore`** — at minimum `.next/`, `node_modules/`, `Mainul's Portfolio/`, `_plans/done/`, `_specs/done/`.

**`package.json` scripts** — add the ones `CLAUDE.md:228` and `/ship` reference:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**`tsconfig.json`** — verify `"strict": true` is set (create-next-app does this by default). No changes expected.

### Phase E — `app/_styles/` skeleton

Create five files. **No design tokens are ported yet** — just empty/skeleton files with comments so the build doesn't fail. Phase 2 of the porting work fills them with the real values from `Mainul's Portfolio/assets/shared.css`.

- `app/_styles/_variables.scss` — skeleton, single `// TODO: port :root tokens from Mainul's Portfolio/assets/shared.css` comment.
- `app/_styles/_mixins.scss` — `@use 'variables' as *;` + skeleton.
- `app/_styles/_typography.scss` — `@use 'variables' as *;` + skeleton.
- `app/_styles/_utils.scss` — skeleton.
- `app/_styles/globals.scss` — `@use 'variables' as *; @use 'typography' as *;` + base reset + body.

### Phase F — `app/layout.tsx` with `next/font/google`

Replace the generated `app/layout.tsx` with one that:

- Imports `'./_styles/globals.scss'` (only place global SCSS gets imported).
- Calls `Teko`, `Josefin_Sans`, `JetBrains_Mono` from `next/font/google` with subsets and weights pulled from the static template.
- Exposes the resulting CSS variable names as classes on `<html>` so SCSS modules can read them through CSS custom properties (matching `--font-display`, `--font-body`, `--font-mono` from the static template).
- Has minimal metadata (`Mainul Islam · Frontend Developer · A/B Testing & Experimentation`) — full metadata config is Phase 7.

Replace `app/page.tsx` with a single-line placeholder so the build works:

```tsx
export default function Home() {
  return <p>Portfolio scaffolded. Phase 2 ports the home page.</p>;
}
```

### Phase G — Verify

```bash
npm install                          # confirm lockfile is clean
npm run typecheck                    # tsc --noEmit; expect clean
npm run lint                         # next lint; expect clean (or one no-op warning)
npm run build                        # production build; expect success
npm run dev &                        # start dev server
sleep 4 && curl -s http://localhost:3000 | grep -i "scaffolded"     # smoke test
kill %1                              # stop dev server
```

Sub-agent pass:

- Invoke the `code-reviewer` sub-agent against the staged diff before opening the PR. Expect a clean punch list (no JSX yet to a11y-fail).

### Phase H — Commit, push, `/finish-feature`

Per workflow:

1. Commit logical units (suggest: one for create-next-app output, one for deps, one for next.config + mdx-components, one for app/\_styles skeleton, one for layout.tsx + page.tsx placeholder).
2. Push each.
3. Run `/ship` to confirm typecheck + lint + build pass.
4. Run `/finish-feature chore/nextjs-scaffold` — this is the dogfood test we've been waiting for.

---

## Verification (after Phase G)

| Check                                    | Expected                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| `npm run typecheck`                      | clean exit                                            |
| `npm run lint`                           | clean exit                                            |
| `npm run build`                          | success, no warnings about missing fonts/SCSS         |
| `npm run dev`                            | starts on `:3000`, page reads "Portfolio scaffolded." |
| `grep -r "from 'next/font/google'" app/` | shows the three font imports in `layout.tsx`          |
| `cat next.config.ts`                     | shows MDX + sassOptions.additionalData                |
| `ls _plans/done/ _specs/done/`           | empty (move happens during `/finish-feature`)         |
| `git status`                             | clean before invoking `/finish-feature`               |

## Edge cases

- **`create-next-app` refuses to scaffold into non-empty dir.** Sibling scaffold avoids this entirely.
- **Latest Next.js bumps a major mid-implementation.** Lock the exact version after install (`package.json` records it). Don't `^` it loose.
- **`sassOptions.additionalData` deprecation.** Next.js may eventually move this; check the docs page during implementation and use the current API.
- **`next/font/google` weight unavailable.** Teko has 300–700 on Google; same for Josefin Sans 300–700; JetBrains Mono 400–800. All in scope.
- **MDX setup requires a top-level `mdx-components.tsx`.** Created in Phase D. Without it, App Router will fail to render `.mdx` pages.
- **TypeScript may flag `next.config.ts` if the project's tsconfig excludes config files.** Default `create-next-app` tsconfig includes `**/*.ts` — should be fine.
- **`block-main` hook fires when we run the implementation from inside Claude Code after restart.** Should not — we'll be on `chore/nextjs-scaffold`, not main.
- **The `code-reviewer` sub-agent may flag the placeholder `<p>`** as needing semantic HTML. Acceptable — it's marked as a phase-2 stub.

## Risk

Low–medium. The destructive moves (deleting `README.md`, `public/*.svg`) are reversible via `git checkout`. `npm install` runs scripts from packages — at this scale, the dependency tree is small and well-audited (`next`, `react`, `sass`, `@next/mdx`). No supply-chain risk worth flagging beyond standard `npm audit` discipline once we're operational.

## Out of scope (next phases)

- **Phase 2** — Port `shared.css` tokens into `app/_styles/`, hand-test the rendered fonts match the static template.
- **Phase 3** — Layout shell: `<Nav/>`, `<Footer/>`, `<CustomCursor/>`, `<Reveal/>` client components.
- **Phase 4** — Home page port (`index.html` → `app/page.tsx` + section components).
- **Phase 5** — About + Contact pages.
- **Phase 6** — Work index + 3 case studies as MDX.
- **Phase 7** — Polish: Metadata API, sitemap, robots, OG image, `<Image/>` swap, self-host the GitHub avatar and CV PDF, dedupe the duplicate hero PNGs.

Each phase gets its own plan + spec + PR.

---

## Retrospective

### What the plan got right

- The sibling-scaffold-then-copy approach worked cleanly. `create-next-app` never touched our `.claude/`, `CLAUDE.md`, `_plans/`, `_specs/`, or `futureWorks.md`.
- `next.config.ts` with `additionalData` as a function (skipping files in `app/_styles/`) avoided the partial-self-import cycle. Build succeeds; partials can `@use 'variables' as *` themselves without conflict.
- Phases A–G ran in order without backtracking. Verification at the end found 2 fixable issues, not 20.

### What the plan got wrong

- **`eslint-plugin-jsx-a11y` is already bundled by `eslint-config-next/core-web-vitals`.** Adding it explicitly to `eslint.config.mjs` produced `ConfigError: Cannot redefine plugin "jsx-a11y"`. Fix: removed the explicit `jsxA11y.flatConfigs.recommended` entry. The package itself is still in `devDependencies` (harmless — it's a transitive dep of `eslint-config-next` anyway and documents intent). To tighten a11y rules beyond the Next defaults, add specific `rules: { 'jsx-a11y/...': 'error' }` entries instead of re-spreading the plugin.
- **ESLint tried to lint `.claude/hooks/*.js`** and flagged `require()` style imports (TS rules applied to CommonJS hook scripts). Fix: added `.claude/**` to `globalIgnores` in `eslint.config.mjs`. Those scripts aren't part of the Next.js source tree.
- **The PostToolUse auto-format hook ran on `next.config.ts` and `mdx-components.tsx` before `.prettierrc` existed**, so they were formatted with Prettier defaults (double quotes, semicolons) instead of our chosen style. `format:check` then caught the inconsistency. Fix: `npm run format` once at the end of the scaffold work to normalize everything. **Lesson for future scaffolds:** write `.prettierrc` BEFORE any other file the auto-format hook will touch.
- **TypeScript version is 5.x, not 6.** `CLAUDE.md` line 11 says "Next.js 16 (App Router), React 19, TypeScript (strict)" — version not specified for TS, so this is fine. But if anyone reads the line as "TypeScript 6," correct that — TS 6 doesn't exist yet (as of 2026-05).

### What was deferred

- The sibling temp directory at `~/Desktop/Practice_Projects/portfolio-scaffold/` was not deleted (the `rm -rf` denylist guard kicked in earlier in the session). It's harmless — just a scrap directory — but the user can clean it up manually: `rm -rf ../portfolio-scaffold` from a regular terminal.
- `npm install` reported 2 moderate vulnerabilities. Not addressed in this PR; the scaffold's dependency tree is what `create-next-app@latest` shipped, and resolving them risks breaking. Logged to `futureWorks.md`.
- `code-reviewer` sub-agent pass on the diff: skipped because the agent isn't loaded in this session (`.claude/agents/*.md` files were created mid-session). The agent will be available after CC restart; running it post-merge if anything looks off is fine.
- End-to-end `/finish-feature` test: deferred to immediately after CC restart. This PR is the first feature the command operates on — that's the dogfood milestone.
