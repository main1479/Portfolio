# AvsB content update — non-technical plan

## Why

The current AvsB entry across the portfolio undersells the project. It frames AvsB as a "CLI-driven A/B testing platform" — but the system that actually exists is much larger: a full-stack experimentation **and** feature-flag platform with a deep statistics engine, edge ingestion, multiple SDKs, and a multi-tenant org/RBAC layer. Built solo over ~10 weeks (Mar–May 2026), pre-launch, no external users yet.

A real, accurate write-up exists. The portfolio needs to be brought in line with it.

## What changes

Two places carry AvsB copy:

1. **The work index entry** (`/work` list and the home Selected Work strip)
   - Summary needs to broaden beyond "CLI-driven" — it's the headline you see in the list, and right now it's wrong.
   - Tags need to reflect the real stack (ClickHouse, Cloudflare Workers, Postgres, statistics).
   - Year/yearStatus reflects 2026 build window, pre-launch status.

2. **The AvsB case study page** (`/work/avsb`)
   - Hero lines + page title + page description — broaden the framing.
   - Meta sidebar (Role / Type / Year / Status) — year → 2026, status reads honestly.
   - Body sections — rewrite to cover what's actually there: experiment builder, visual editor, feature flags, statistics engine, edge architecture, SDK family, scale of the system (410k LOC, 250 routes, 71 models, ~8k tests).
   - The CLI code mock stays — it's a strong visual and the CLI is still a real surface — but it's reframed as "one of several developer surfaces" rather than the whole product.
   - Stack list grows: Next.js 16, React 19, TypeScript strict, Prisma 7 / Postgres, ClickHouse, Redux Toolkit, NextAuth v5, Zod, Cloudflare Workers + Durable Objects, R2.
   - Status section is replaced with a "by the numbers" + honest pre-launch note.

## What doesn't change

- Routes, URLs, slugs — `/work/avsb` stays.
- Page layout, hero composition, `<CaseLayout>`, `<CaseBlock>`, `<CaseVisuals>`, `<CodeMock>` components.
- The CLI code mock itself (the keystrokes shown) — accurate enough as a CLI illustration.
- Open Graph image generator — content is data-driven from `frontmatter`, so it picks up the new copy automatically.

## Scope guard

- Not adding new visuals (e.g. real dashboard screenshots). Those are tracked in `futureWorks.md` already.
- Not redesigning the case-study template. Same components, new copy.
- Not touching the other case studies.

## Workflow

1. Plan → push (this file).
2. Spec → push.
3. Branch `chore/avsb-content-update` off `main`.
4. Implement: work-projects.ts update, then content.mdx rewrite. One commit per logical unit.
5. `/ship` (typecheck + lint + build).
6. Push.
