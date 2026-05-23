# Spec — Work index + 3 case studies (Phase 6)

**Status:** Draft — awaiting approval
**Date:** 2026-05-23
**Branch:** `feature/work-and-cases`
**Plan:** `_plans/work-and-cases-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 6 (lines 771–820), §5.3 (work index), §5.4 (case studies), §6.2 (`/work` content), §6.3–6.5 (case content), §13 (open questions)
**Source of truth (markup):** `Mainul's Portfolio/work.html` (306 lines), `case-avsb.html`, `case-kemondoctor.html`, `case-client.html`
**Source of truth (styles):** each legacy file's `<style>` block + `assets/shared.css`
**Source of truth (behaviour):** the inline `<script>` at the bottom of `work.html` (lines 286–303)

---

## 0. Recap

Build the `/work` index and three case-study routes. `/work` ports the legacy six-row index with a 4-chip filter and a live project counter. Each case study ships as MDX, wrapped by a shared `CaseLayout` that reads structured frontmatter and renders the breadcrumb + hero + meta strip + body + next-case pager + per-case footer heading. The MDX body uses globally-injected case primitives (`CaseBlock`, `CaseVisuals`, `CodeMock`, `Countries`) so authors never import them by hand. Composition uses Phase 3 primitives wherever they fit; new visuals live in component modules.

This phase also extends `workProjects` from 3 entries to 6 and extends the `WorkProject` type with `categories`, `metaShort`, and `hasCase`.

## 1. File tree

```
app/
├── work/                                                       ← NEW route folder
│   ├── page.tsx                                                ← server — composes /work
│   ├── _workPage.module.scss                                   ← page-level layout
│   ├── _components/
│   │   ├── Filters/
│   │   │   ├── WorkIndexClient.tsx                             ← 'use client' — state + row list
│   │   │   ├── Filters.tsx                                     ← 'use client' (flat) — the chip row
│   │   │   └── _Filters.module.scss
│   │   ├── IndexRow/
│   │   │   ├── IndexRow.tsx                                    ← server — one row
│   │   │   └── _IndexRow.module.scss
│   │   └── case/                                                ← case-study primitives
│   │       ├── CaseLayout.tsx                                  ← server — wraps each case page
│   │       ├── _CaseLayout.module.scss
│   │       ├── CaseHero.tsx                                    ← server (flat) — breadcrumb + title + summary
│   │       ├── _CaseHero.module.scss
│   │       ├── CaseMeta.tsx                                    ← server (flat) — 4-cell strip
│   │       ├── _CaseMeta.module.scss
│   │       ├── CaseBlock.tsx                                   ← server — two-column block
│   │       ├── _CaseBlock.module.scss
│   │       ├── CaseVisuals.tsx                                 ← server — visual placeholder slot
│   │       ├── _CaseVisuals.module.scss
│   │       ├── CodeMock.tsx                                    ← server — dark terminal block
│   │       ├── _CodeMock.module.scss
│   │       ├── NextCase.tsx                                    ← server — bottom pager
│   │       ├── _NextCase.module.scss
│   │       ├── Countries.tsx                                   ← server — 6-cell flag grid
│   │       ├── _Countries.module.scss
│   │       ├── CaseImage.tsx                                   ← server (flat) — next/image wrapper for MDX <img>
│   │       └── case-frontmatter-schema.ts                      ← Zod schema for frontmatter
│   ├── avsb/
│   │   ├── page.tsx                                            ← 5-line shim
│   │   └── content.mdx                                         ← case copy
│   ├── kemon-doctor/
│   │   ├── page.tsx                                            ← 5-line shim
│   │   └── content.mdx
│   └── client/
│       ├── page.tsx                                            ← 5-line shim
│       └── content.mdx
├── _lib/
│   ├── work-projects.ts                                        ← EXTENDED: 3 → 6 entries + new fields
│   └── case-registry.ts                                        ← NEW — next-case lookup
└── _types/
    ├── work.ts                                                 ← EXTENDED: categories, metaShort, hasCase
    └── case.ts                                                 ← NEW — case frontmatter + meta types

mdx-components.tsx                                              ← EXTENDED — case primitives + img/a/pre/code
```

**Counts:** 24 new files (10 component .tsx + 10 .module.scss + 3 case `page.tsx` shims + 3 case `content.mdx` + `CaseImage.tsx` + frontmatter Zod schema + `case-registry.ts` + `_types/case.ts`); 3 modified files (`mdx-components.tsx`, `app/_lib/work-projects.ts`, `app/_types/work.ts`). No edits to chrome, tokens, layout.tsx, or any Phase 3–5 component logic.

**No `index.ts` re-exports anywhere.** Every consumer imports the named file directly.

## 2. Type contracts

### 2.1 `app/_types/work.ts` (extended)

```ts
export type WorkCategory = 'product' | 'experimentation' | 'client';

export type WorkProject = {
  slug: string;
  num: string;
  title: string;
  /** Long, voice-y summary — used on the home SelectedWork row. */
  summary: string;
  /** Short, punchy meta sentence — used on the /work index row. */
  metaShort: string;
  tags: readonly string[];
  /** Categories the project belongs to; drives the index filter chips. */
  categories: readonly WorkCategory[];
  /** Featured on the home page's SelectedWork section. */
  featured: boolean;
  order: number;
  year?: string;
  type?: 'own' | 'client' | 'agency';
  /** Year + status sentence as shown on the /work index row's year/status column. */
  yearStatus?: string;
  /** True if the project has its own /work/<slug> case page. False = stub row that links to a shared case page (or to mailto). */
  hasCase: boolean;
  /** Target href for the index row. If hasCase, this is `/work/${slug}`; if stub, it's the page the row falls through to. */
  href: string;
};
```

### 2.2 `app/_types/case.ts` (new)

```ts
export type CaseAccent = 'plain' | 'accent' | 'outline';

export type CaseHeroLine = {
  text: string;
  /** `plain` (default), `accent` (var(--accent) ink), or `outline` (`-webkit-text-stroke`). */
  style: CaseAccent;
  /** If true, append an accent-coloured `.` after the line. AvsB's `AvsB` line uses this. */
  trailingAccentDot?: boolean;
};

export type CaseMetaCell = {
  label: string;
  /** Display value; line breaks allowed via `\n` (rendered as `<br/>`). */
  value: string;
  /** Show an accent dot (pulsing) before the value. Used for the In-progress cell. */
  accentDot?: boolean;
};

export type NextCasePointer = {
  /** Small label above the title, eg "Next case · 02" or "Back to · 01". */
  label: string;
  /** Display title of the next case. */
  title: string;
  /** Slug of the next case (CaseLayout resolves the href as `/work/${slug}`). */
  slug: string;
};

export type CaseFrontmatter = {
  /** Case slug; must match the folder name (`avsb` / `kemon-doctor` / `client`). */
  slug: string;
  /** Ordinal as shown in the breadcrumb (`01`, `02`, `03`). */
  num: string;
  /** Display title (single line, for <head> + breadcrumb suffix). */
  title: string;
  /** <title> tag content. */
  pageTitle: string;
  /** <meta name="description"> content. */
  pageDescription: string;
  /** Hero display title lines + per-line treatment. */
  heroLines: readonly CaseHeroLine[];
  /** Hero summary paragraph — rendered as plain text inside a <p class="lede">. */
  summary: string;
  /** 4-cell meta strip. Labels vary per case (Year/Status vs Span/Reach). */
  meta: readonly CaseMetaCell[];
  /** Bottom-pager next-case pointer. */
  next: NextCasePointer;
  /** Per-case footer heading text (the big "Got something to test?" copy). */
  footerHeading: string;
};

export type CodeMockLineType = 'comment' | 'prompt' | 'response' | 'empty';

export type CodeMockToken =
  | { kind: 'text'; value: string }
  | { kind: 'comment'; value: string }
  | { kind: 'prompt'; value: string }
  | { kind: 'keyword'; value: string }
  | { kind: 'value'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'accent'; value: string };

export type CodeMockLine = {
  type: CodeMockLineType;
  /** Tokens that compose the line. An `empty` line ignores this and renders a blank row. */
  tokens?: readonly CodeMockToken[];
};

export type CountryCell = {
  /** Two-letter ISO-ish flag label (UK / IN / SK / AT / AU / CA). */
  flag: string;
  /** Full country name. */
  name: string;
};
```

Notes:

- `CaseFrontmatter` is the only contract the Zod schema (next section) enforces. Everything that flows into `CaseHero` and `CaseMeta` flows out of it.
- `CodeMockLine.tokens` is intentionally typed as a sequence of discriminated unions, not a templated string. Author errors at the AvsB content site fail at typecheck.
- `CountryCell.flag` is a _text_ label, not an emoji — matches the legacy treatment (`UK` / `IN` etc. styled as accent monospace, not flag emoji).

### 2.3 Notes on types

- The duplicated voice (`summary` vs `metaShort`) is intentional — see plan §Decisions. Each surface gets a sentence sized for it.
- `WorkCategory` is a string-literal union for typechecker leverage at filter sites. The filter chips themselves render labels from a separate map (next section).
- `WorkProject.hasCase` is a separate field from "does `href` point at `/work/${slug}`?" because the stub rows currently DO point at `/work/client` (someone else's case), and `hasCase` describes the project not its destination.

## 3. Content files

### 3.1 `app/_lib/work-projects.ts` (extended)

```ts
import type { WorkProject } from '../_types/work';

export const workProjects = [
  {
    slug: 'avsb',
    num: '01',
    title: 'AvsB',
    summary: 'An in-house, CLI-driven A/B testing platform — built from scratch.',
    metaShort: 'CLI-driven experimentation platform built from scratch.',
    tags: ['Next.js', 'TypeScript', 'ClickHouse', 'Product'],
    categories: ['product', 'experimentation'],
    featured: true,
    order: 1,
    year: '2025 – Present',
    type: 'own',
    yearStatus: '2025 · In progress',
    hasCase: true,
    href: '/work/avsb',
  },
  {
    slug: 'kemon-doctor',
    num: '02',
    title: 'Kemon Doctor',
    summary: 'A non-profit platform helping patients in Bangladesh find trustworthy doctors.',
    metaShort: 'Non-profit doctor review platform for Bangladesh.',
    tags: ['Next.js 15', 'PostgreSQL', 'Drizzle', 'Solo'],
    categories: ['product'],
    featured: true,
    order: 2,
    year: '2025 – Present',
    type: 'own',
    yearStatus: '2025 · In progress',
    hasCase: true,
    href: '/work/kemon-doctor',
  },
  {
    slug: 'client',
    num: '03',
    title: 'Client Experiments',
    summary: '4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients.',
    metaShort: '4+ years of A/B tests for ecommerce & SaaS clients.',
    tags: ['Optimizely', 'Kameleoon', 'Qubit'],
    categories: ['experimentation', 'client'],
    featured: true,
    order: 3,
    year: '2019 – Present',
    type: 'client',
    yearStatus: '2019 – Present',
    hasCase: true,
    href: '/work/client',
  },
  {
    slug: 'flatwhite',
    num: '04',
    title: 'Flatwhite',
    summary: 'Template development for a hotel listing company.',
    metaShort: 'Template development for a hotel listing company.',
    tags: ['HTML', 'SCSS', 'XD to code'],
    categories: ['client'],
    featured: false,
    order: 4,
    year: '2020',
    type: 'client',
    yearStatus: '2020 · Romania',
    hasCase: false,
    href: '/work/client',
  },
  {
    slug: 'crypto-gods',
    num: '05',
    title: 'Crypto Gods',
    summary: 'Landing page for a crypto community, Figma to code.',
    metaShort: 'Landing page for a crypto community, Figma to code.',
    tags: ['HTML', 'SCSS', 'Bootstrap'],
    categories: ['client'],
    featured: false,
    order: 5,
    year: '2020',
    type: 'client',
    yearStatus: '2020',
    hasCase: false,
    href: '/work/client',
  },
  {
    slug: 'pascal',
    num: '06',
    title: 'Pascal',
    summary: 'Website for Pascal Wealth Tech, frontend build.',
    metaShort: 'Website for Pascal Wealth Tech, frontend build.',
    tags: ['React', 'SCSS'],
    categories: ['client'],
    featured: false,
    order: 6,
    year: '2021',
    type: 'client',
    yearStatus: '2021 · Canada',
    hasCase: false,
    href: '/work/client',
  },
] as const satisfies readonly WorkProject[];

export const featuredWorkProjects = workProjects.filter((p) => p.featured);

/** Filter-chip definitions for `/work`. */
export const workFilters = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Products' },
  { value: 'experimentation', label: 'Experimentation' },
  { value: 'client', label: 'Client work' },
] as const;

export type WorkFilterValue = (typeof workFilters)[number]['value'];
```

Notes:

- The previous `summary` field for the 3 existing projects stays unchanged — home `SelectedWork` keeps reading it. `metaShort` is the new field. For the 3 stub projects, the two fields are identical (the home doesn't render them anyway).
- The 3 stub projects all carry `href: '/work/client'` — see plan §Decisions. Authoring `metaShort` for them mirrors the legacy index copy verbatim.
- `workFilters` lives next to `workProjects` rather than in `contact-content.ts`-style content files because filters are structural, not editorial.

### 3.2 `app/_lib/case-registry.ts` (new)

```ts
import type { NextCasePointer } from '../_types/case';

/** Slug → next case pointer for the bottom pager. The wrap entry uses `Back to · 01`. */
const NEXT_CASE: Record<string, NextCasePointer> = {
  avsb: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
  'kemon-doctor': { label: 'Next case · 03', title: 'Client Work', slug: 'client' },
  client: { label: 'Back to · 01', title: 'AvsB', slug: 'avsb' },
};

export function getNextCase(currentSlug: string): NextCasePointer {
  const next = NEXT_CASE[currentSlug];
  if (!next) throw new Error(`No next-case pointer registered for slug: ${currentSlug}`);
  return next;
}
```

Single source of truth for the wrap. Adding a 4th case = one edit here + one new MDX folder. The MDX `frontmatter.next` field is still authored (plan §Decisions: frontmatter is the per-case truth) and `CaseLayout` reads from frontmatter; this registry is a runtime sanity check used only if a future implementation chooses to derive `next` programmatically instead of via frontmatter. Default: frontmatter wins, registry is a safety net.

Concretely: `CaseLayout` prefers `frontmatter.next`, and asserts that `frontmatter.next.slug === getNextCase(frontmatter.slug).slug` in dev (`if (process.env.NODE_ENV !== 'production' && …) console.warn(…)`).

### 3.3 Frontmatter Zod schema — `app/work/_components/case/case-frontmatter-schema.ts`

```ts
import { z } from 'zod';

const caseHeroLine = z.object({
  text: z.string().min(1),
  style: z.enum(['plain', 'accent', 'outline']),
  trailingAccentDot: z.boolean().optional(),
});

const caseMetaCell = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  accentDot: z.boolean().optional(),
});

const nextCasePointer = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
});

export const caseFrontmatterSchema = z.object({
  slug: z.string().min(1),
  num: z.string().regex(/^\d{2}$/, 'num must be a 2-digit string like "01"'),
  title: z.string().min(1),
  pageTitle: z.string().min(1),
  pageDescription: z.string().min(1),
  heroLines: z.array(caseHeroLine).min(1).max(4),
  summary: z.string().min(1),
  meta: z.array(caseMetaCell).length(4),
  next: nextCasePointer,
  footerHeading: z.string().min(1),
});

/** Validates frontmatter at module-load time; throws on any author error. */
export function validateFrontmatter(input: unknown) {
  return caseFrontmatterSchema.parse(input);
}
```

Each case MDX file calls `validateFrontmatter(frontmatter)` at the top of its export. Build fails on any author error.

## 4. MDX components map — `mdx-components.tsx` (extended)

```ts
import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CaseBlock } from './app/work/_components/case/CaseBlock';
import { CaseVisuals } from './app/work/_components/case/CaseVisuals';
import { CodeMock } from './app/work/_components/case/CodeMock';
import { Countries } from './app/work/_components/case/Countries';
import { CaseImage } from './app/work/_components/case/CaseImage';

const isInternalHref = (href: string) => href.startsWith('/') || href.startsWith('#');
const isMailto = (href: string) => href.startsWith('mailto:');

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({ href, children, ...rest }) => {
      if (!href) return <a {...rest}>{children}</a>;
      if (isInternalHref(href)) {
        return (
          <Link href={href} {...rest}>
            {children}
          </Link>
        );
      }
      if (isMailto(href)) {
        return (
          <a href={href} {...rest}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    },
    img: ({ src, alt, width, height, ...rest }) => (
      <CaseImage
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        width={typeof width === 'number' ? width : Number(width ?? 1200)}
        height={typeof height === 'number' ? height : Number(height ?? 800)}
        {...rest}
      />
    ),
    // Case primitives injected globally so MDX bodies use them without imports.
    CaseBlock,
    CaseVisuals,
    CodeMock,
    Countries,
  };
}
```

Notes:

- `pre` / `code` overrides are deliberately omitted — case bodies don't use fenced code blocks (the AvsB terminal is `<CodeMock>` JSX, not a markdown fence). Adding pre/code styling later is non-breaking.
- The `img` override accepts MDX's `width`/`height` props but defaults if a markdown `![alt](src)` form omits them (which it must, since MDX markdown can't carry dimensions). Authors use `<CaseImage>` directly for known dimensions; the markdown shortcut falls through with safe defaults.
- The case primitives `CaseHero`, `CaseMeta`, `NextCase` are NOT injected — they're chrome rendered by `CaseLayout` from frontmatter, not body elements.

## 5. Page composition

### 5.1 `app/work/page.tsx`

```tsx
import { Container } from '../_components/Container/Container';
import { PageIntro } from '../_components/PageIntro/PageIntro';
import { Footer } from '../_components/Footer/Footer';
import { workProjects, workFilters } from '../_lib/work-projects';
import { WorkIndexClient } from './_components/Filters/WorkIndexClient';
import styles from './_workPage.module.scss';

export const metadata = {
  title: 'Work · Mainul Islam',
  description: 'A mix of experimentation platforms, products, and client experiment work.',
};

export default function WorkPage() {
  return (
    <>
      <PageIntro
        label="02 / Work Index"
        titleNodes={
          <>
            Work,
            <br />
            <span className="accent">in detail.</span>
          </>
        }
        sub="A mix of experimentation platforms, products, and client experiment work — spanning startups and individuals across six countries."
      />
      <section className={styles.indexSection}>
        <Container>
          <WorkIndexClient projects={workProjects} filters={workFilters} />
          <p className={styles.confidentiality}>
            Client names appear only with written permission. Anything not listed here stays
            confidential — that&rsquo;s how this work has to work.
          </p>
        </Container>
      </section>
      <Footer
        heading={
          <>
            Got a project? —<br />
            <a href="mailto:m.main2402@gmail.com">
              m.main2402
              <wbr />
              @gmail.com
            </a>
          </>
        }
      />
    </>
  );
}
```

### 5.2 `app/work/avsb/page.tsx` (the shim)

```tsx
import Content, { frontmatter } from './content.mdx';
import { CaseLayout } from '../_components/case/CaseLayout';

export const metadata = {
  title: frontmatter.pageTitle,
  description: frontmatter.pageDescription,
};

export default function AvsbCasePage() {
  return (
    <CaseLayout frontmatter={frontmatter}>
      <Content />
    </CaseLayout>
  );
}
```

The Kemon Doctor and Client shims are identical — only the import path and component name differ. Three files, same five-line body. No abstraction warranted.

### 5.3 `app/work/_workPage.module.scss`

```scss
@use 'variables' as *;
@use 'mixins' as *;

.indexSection {
  padding-block: clamp(40px, 6vw, 96px) var(--section-y);
}

.confidentiality {
  margin-top: clamp(60px, 8vw, 100px);
  max-width: 60ch;
  font-size: 1.5rem;
  line-height: 1.55;
  color: var(--fg-muted);
}
```

Page-level scss only. Index list layout lives in `_IndexRow.module.scss`; filter row layout lives in `_Filters.module.scss`.

## 6. Component specs

### 6.1 `Filters/WorkIndexClient.tsx` — 'use client'

```tsx
'use client';

import { useState } from 'react';
import { Filters } from './Filters';
import { IndexRow } from '../IndexRow/IndexRow';
import type { WorkProject } from '../../../_types/work';
import type { WorkFilterValue } from '../../../_lib/work-projects';

type Props = {
  projects: readonly WorkProject[];
  filters: readonly { value: WorkFilterValue; label: string }[];
};

export function WorkIndexClient({ projects, filters }: Props) {
  const [active, setActive] = useState<WorkFilterValue>('all');
  const visible =
    active === 'all' ? projects : projects.filter((p) => p.categories.includes(active));

  return (
    <>
      <Filters filters={filters} active={active} onChange={setActive} count={visible.length} />
      <ol className={'index'} role="list">
        {visible.map((project) => (
          <IndexRow key={project.slug} project={project} />
        ))}
      </ol>
    </>
  );
}
```

The `index` class lives in `_IndexRow.module.scss` (or a small `_WorkIndex.module.scss` shared with `Filters`) — see §6.3 for the structure. `role="list"` is redundant on `<ol>` but defensive against `list-style: none` rendering tools that strip semantics in some browsers (Safari quirk).

### 6.2 `Filters/Filters.tsx` — 'use client' (flat)

```tsx
'use client';

import styles from './_Filters.module.scss';
import type { WorkFilterValue } from '../../../_lib/work-projects';

type Props = {
  filters: readonly { value: WorkFilterValue; label: string }[];
  active: WorkFilterValue;
  onChange: (value: WorkFilterValue) => void;
  count: number;
};

export function Filters({ filters, active, onChange, count }: Props) {
  return (
    <div className={styles.filters} role="toolbar" aria-label="Filter projects">
      <span className={styles.label}>Filter</span>
      {filters.map((f) => (
        <button
          key={f.value}
          type="button"
          className={`${styles.chip} ${active === f.value ? styles.chipActive : ''}`}
          aria-pressed={active === f.value}
          onClick={() => onChange(f.value)}
        >
          {f.label}
        </button>
      ))}
      <span className={styles.count}>
        <span aria-live="polite">{String(count).padStart(2, '0')}</span> projects
      </span>
    </div>
  );
}
```

Notes:

- `aria-pressed` on the button gives screen readers a real selected-state signal. `aria-live="polite"` on the count span announces the new total when a filter changes.
- `role="toolbar"` on the wrapper marks it as a grouped control region.
- Tab order: Filter label is non-tabbable text, then each chip is tabbable in DOM order, then the count. No arrow-key navigation between chips — they're independent toggles (only one can be pressed, but the role isn't `radiogroup` because each chip can be the target of a direct click without arrow-key prerequisite).

### 6.3 `IndexRow/IndexRow.tsx` — server

```tsx
import Link from 'next/link';
import { Arrow } from '../../../_components/Arrow/Arrow';
import type { WorkProject } from '../../../_types/work';
import styles from './_IndexRow.module.scss';

export function IndexRow({ project }: { project: WorkProject }) {
  return (
    <li className={styles.row}>
      <Link href={project.href} className={styles.link} data-cursor="hover">
        <span className={styles.num}>{project.num}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <span className={styles.meta}>{project.metaShort}</span>
        <span className={styles.tags}>{project.tags.join(' · ')}</span>
        <span className={styles.year}>{project.yearStatus ?? project.year ?? ''}</span>
        <span className={styles.arrow} aria-hidden="true">
          <Arrow size={16} strokeWidth={1.6} />
        </span>
      </Link>
    </li>
  );
}
```

CSS class map (per `_IndexRow.module.scss`):

| Module class | Legacy class                            |
| ------------ | --------------------------------------- |
| `.row`       | `.index__row` (wrapper `<li>`)          |
| `.link`      | (legacy uses `<a>` directly as the row) |
| `.num`       | `.index__num`                           |
| `.title`     | `.index__title`                         |
| `.meta`      | `.index__meta`                          |
| `.tags`      | `.index__tags`                          |
| `.year`      | `.index__year`                          |
| `.arrow`     | `.index__arrow`                         |

Grid: `60px minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) 100px 60px` on desktop. Padding `clamp(28px, 3.4vw, 48px) 0`. `border-top: 1px solid var(--rule-strong);` on every row; the last visible row gains `border-bottom` via a parent `.index :last-child` rule.

Hover (wrapped in `@include reduced-motion-safe`):

- Row background: `linear-gradient(to right, var(--paper), transparent 80%)`
- `.title`: `transform: translateX(10px); color: var(--accent);`
- `.arrow`: `background: var(--accent); color: var(--accent-ink); border-color: var(--accent); transform: rotate(-45deg);`

Title font: `font-family: var(--font-display); font-size: clamp(3.4rem, 5vw, 6.8rem); text-transform: uppercase; font-weight: 500; line-height: 0.95;`.

Meta font: `font-size: 1.5rem; line-height: 1.45; max-width: 32ch; color: var(--fg-soft);`.

Tags: `font-family: var(--font-mono); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-muted);`.

Year: same as tags, right-aligned.

Arrow circle: 44px square, `border: 1px solid var(--rule-strong); border-radius: 999px; display: grid; place-items: center;`.

Breakpoints:

- **≤900px** — grid collapses to two columns (`32px 1fr`): num in column 1, title spans cols 1+2 on a new row, meta/tags/year/arrow stack in col 2. Title font drops to `clamp(3rem, 5vw, 5.4rem)`.
- **≤640px** — title `font-size: 3.2rem`, arrow circle shrinks to 36px, padding `22px 0`.
- **≤380px** — title floors at `2.8rem`, tags drop to `0.95rem`.

`data-cursor="hover"` on the `<a>` is the Phase 3 CustomCursor marker — same pattern as home WorkRow.

### 6.4 `case/CaseLayout.tsx` — server

```tsx
import { Container } from '../../../_components/Container/Container';
import { Footer } from '../../../_components/Footer/Footer';
import { CaseHero } from './CaseHero';
import { CaseMeta } from './CaseMeta';
import { NextCase } from './NextCase';
import { getNextCase } from '../../../_lib/case-registry';
import { validateFrontmatter } from './case-frontmatter-schema';
import type { CaseFrontmatter } from '../../../_types/case';
import styles from './_CaseLayout.module.scss';

type Props = {
  frontmatter: CaseFrontmatter;
  children: React.ReactNode;
};

export function CaseLayout({ frontmatter, children }: Props) {
  // Validate once at render time. Throws on schema mismatch — catches frontmatter typos at build.
  const fm = validateFrontmatter(frontmatter) as CaseFrontmatter;

  if (process.env.NODE_ENV !== 'production') {
    const registered = getNextCase(fm.slug);
    if (registered.slug !== fm.next.slug) {
      // eslint-disable-next-line no-console
      console.warn(
        `Case "${fm.slug}" frontmatter.next.slug (${fm.next.slug}) disagrees with case-registry (${registered.slug}).`,
      );
    }
  }

  return (
    <>
      <CaseHero num={fm.num} breadcrumbTitle={fm.title} lines={fm.heroLines} summary={fm.summary} />
      <Container>
        <CaseMeta cells={fm.meta} />
      </Container>
      <div className={styles.body}>
        <Container>{children}</Container>
      </div>
      <Container>
        <NextCase pointer={fm.next} />
      </Container>
      <Footer
        heading={
          <>
            {fm.footerHeading} —<br />
            <a href="mailto:m.main2402@gmail.com">
              m.main2402
              <wbr />
              @gmail.com
            </a>
          </>
        }
      />
    </>
  );
}
```

`_CaseLayout.module.scss` is minimal — just `.body { padding-block: clamp(60px, 8vw, 120px); }` to space the meta strip from the first block and the last block from `NextCase`.

### 6.5 `case/CaseHero.tsx` — server (flat)

```tsx
import Link from 'next/link';
import { Container } from '../../../_components/Container/Container';
import type { CaseHeroLine } from '../../../_types/case';
import styles from './_CaseHero.module.scss';

type Props = {
  num: string;
  breadcrumbTitle: string;
  lines: readonly CaseHeroLine[];
  summary: string;
};

export function CaseHero({ num, breadcrumbTitle, lines, summary }: Props) {
  return (
    <header className={styles.hero}>
      <Container>
        <p className={styles.breadcrumb}>
          <Link href="/work">Work</Link>
          <span aria-hidden="true"> / </span>
          <span className={styles.breadcrumbCurrent}>
            {num} — {breadcrumbTitle}
          </span>
        </p>
        <h1 className={styles.title}>
          {lines.map((line, i) => {
            const classes = [
              styles.line,
              line.style === 'accent' ? styles.lineAccent : '',
              line.style === 'outline' ? styles.lineOutline : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <span key={i} className={classes}>
                {line.text}
                {line.trailingAccentDot && <span className={styles.dot}>.</span>}
                {i < lines.length - 1 && <br />}
              </span>
            );
          })}
        </h1>
        <p className={styles.summary}>{summary}</p>
      </Container>
    </header>
  );
}
```

Hero CSS:

- `.hero` — `padding-block: clamp(120px, 16vw, 240px) clamp(60px, 8vw, 120px);` `border-bottom: 1px solid var(--rule-strong);`
- `.breadcrumb` — `font-family: var(--font-mono); font-size: 1.15rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-muted); margin-bottom: 48px;`
- `.title` — `font-family: var(--font-display); font-size: clamp(6.4rem, 11vw, 17rem); line-height: 0.88; font-weight: 500; text-transform: uppercase; margin: 0;`
- `.line` — `display: block;`
- `.lineAccent` — `color: var(--accent);`
- `.lineOutline` — `color: transparent; -webkit-text-stroke: 1.2px var(--fg);`
- `.dot` — `color: var(--accent);` (the trailing accent dot on AvsB's first line)
- `.summary` — `max-width: 62ch; margin-top: clamp(40px, 5vw, 80px); font-size: clamp(1.7rem, 1.7vw, 2.1rem); line-height: 1.45; color: var(--fg-soft);`
- ≤640px: title drops to `clamp(5.4rem, 17vw, 9rem)`; summary 1.6rem.
- ≤380px: title floors at `4.8rem`.

### 6.6 `case/CaseMeta.tsx` — server (flat)

```tsx
import type { CaseMetaCell } from '../../../_types/case';
import styles from './_CaseMeta.module.scss';

export function CaseMeta({ cells }: { cells: readonly CaseMetaCell[] }) {
  return (
    <dl className={styles.meta}>
      {cells.map((cell) => (
        <div key={cell.label} className={styles.cell}>
          <dt className={styles.label}>{cell.label}</dt>
          <dd className={styles.value}>
            {cell.accentDot && <span className={styles.dot} aria-hidden="true" />}
            {cell.value.split('\n').map((segment, i, arr) => (
              <span key={i}>
                {segment}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

CSS:

- `.meta` — `display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: clamp(20px, 3vw, 56px); padding-block: clamp(48px, 6vw, 80px); border-bottom: 1px solid var(--rule-strong); margin: 0;`
- `.label` — `font-family: var(--font-mono); font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-muted); margin-bottom: 12px;`
- `.value` — `font-family: var(--font-display); font-size: clamp(1.8rem, 2.2vw, 2.6rem); line-height: 1.1; text-transform: uppercase; font-weight: 500; margin: 0;`
- `.dot` — `width: 10px; height: 10px; border-radius: 999px; background: var(--accent); display: inline-block; margin-right: 10px; vertical-align: 1px; animation: nav-pulse 1.6s ease-in-out infinite;` (wrapped in reduced-motion-safe)
- ≤900px: grid collapses to 2×2.
- ≤640px: grid stays 2×2; values drop to `clamp(1.6rem, 4vw, 2rem)`.
- ≤380px: 1-column stack.

### 6.7 `case/CaseBlock.tsx` — server

```tsx
import { Reveal } from '../../../_components/Reveal/Reveal';
import styles from './_CaseBlock.module.scss';

type Props = {
  num: string;
  label: string;
  heading: string;
  /** If true, append an accent-coloured `.` after the heading. */
  accentDot?: boolean;
  children: React.ReactNode;
};

export function CaseBlock({ num, label, heading, accentDot = true, children }: Props) {
  return (
    <Reveal as="section" className={styles.block}>
      <div className={styles.side}>
        <span className={styles.num}>{num}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.heading}>
          {heading}
          {accentDot && <span className={styles.dot}>.</span>}
        </h2>
        <div className={styles.content}>{children}</div>
      </div>
    </Reveal>
  );
}
```

CSS:

- `.block` — `display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr); gap: clamp(40px, 6vw, 120px); padding-block: clamp(60px, 8vw, 120px); border-top: 1px solid var(--rule-strong);`
- `.side` — `position: sticky; top: 110px; display: flex; flex-direction: column; gap: 4px;`
- `.num` — `font-family: var(--font-mono); font-size: 1.05rem; color: var(--fg-muted); letter-spacing: 0.06em;`
- `.label` — `font-family: var(--font-mono); font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg);`
- `.heading` — `font-family: var(--font-display); font-size: clamp(3.6rem, 5.2vw, 8rem); line-height: 0.95; font-weight: 500; text-transform: uppercase; margin: 0 0 32px;`
- `.dot` — `color: var(--accent);`
- `.content p` — `font-size: clamp(1.7rem, 1.7vw, 2.1rem); line-height: 1.5; color: var(--fg-soft); max-width: 56ch; margin: 0 0 1.4em;`
- `.content ul` — `list-style: none; padding: 0; margin: 0;` items use a mono `·` marker and the same body type as paragraphs, with `padding-left: 24px; position: relative;` and `::before { content: '·'; position: absolute; left: 4px; color: var(--accent); }`.
- `.content strong` — `color: var(--fg); font-weight: 600;`
- `.content em` — `font-style: italic; color: var(--fg-soft);`
- `.content .accent` — `color: var(--accent);`
- ≤900px: grid collapses to single column; `.side` becomes static.
- ≤640px: heading `clamp(3rem, 8vw, 4.4rem)`; content body `1.6rem`.

`accentDot` defaults to `true` because every legacy case-block heading ends with an accent `.`.

The `.accent`, `strong`, `em` styles target MDX-rendered inline elements: `*text*` → `<em>`, `**text**` → `<strong>`, and `<span className="accent">text</span>` for the accent runs.

### 6.8 `case/CaseVisuals.tsx` — server

```tsx
import styles from './_CaseVisuals.module.scss';

type Slot = { caption: string; aspect?: string };

type Props =
  | { layout: 'single'; primary: Slot }
  | { layout: 'single-plus-secondary'; primary: Slot; secondary: Slot; children?: React.ReactNode }
  | { layout: 'triple'; items: readonly [Slot, Slot, Slot] };

export function CaseVisuals(props: Props) {
  if (props.layout === 'single') {
    return (
      <figure className={styles.single}>
        <div className={styles.slot} style={{ aspectRatio: props.primary.aspect ?? '16/10' }} />
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
    );
  }
  if (props.layout === 'triple') {
    return (
      <div className={styles.triple}>
        {props.items.map((it, i) => (
          <figure key={i} className={styles.tripleItem}>
            <div className={styles.slot} style={{ aspectRatio: it.aspect ?? '3/5' }} />
            <figcaption className={styles.caption}>{it.caption}</figcaption>
          </figure>
        ))}
      </div>
    );
  }
  // single-plus-secondary — primary is the children area (used for AvsB's CodeMock), secondary is a placeholder
  return (
    <div className={styles.duo}>
      <figure className={styles.duoPrimary}>
        {props.children ?? (
          <div className={styles.slot} style={{ aspectRatio: props.primary.aspect ?? '16/10' }} />
        )}
        <figcaption className={styles.caption}>{props.primary.caption}</figcaption>
      </figure>
      <figure className={styles.duoSecondary}>
        <div className={styles.slot} style={{ aspectRatio: props.secondary.aspect ?? '4/3' }} />
        <figcaption className={styles.caption}>{props.secondary.caption}</figcaption>
      </figure>
    </div>
  );
}
```

CSS:

- `.slot` — `background: repeating-linear-gradient(135deg, var(--paper-deep) 0 12px, var(--paper) 12px 24px); border-radius: 6px; border: 1px solid var(--rule-strong);`
- `.caption` — `font-family: var(--font-mono); font-size: 1.05rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-muted); margin-top: 16px;`
- `.single`, `.duo`, `.triple` — display grids with case-specific gaps. `.triple` is `repeat(3, minmax(0, 1fr))` desktop, 1-column at ≤640px. `.duo` is `1.6fr 1fr` desktop, single column at ≤900px.

### 6.9 `case/CodeMock.tsx` — server

```tsx
import type { CodeMockLine } from '../../../_types/case';
import styles from './_CodeMock.module.scss';

export function CodeMock({ lines }: { lines: readonly CodeMockLine[] }) {
  return (
    <pre className={styles.mock} aria-label="Example terminal session">
      <code>
        {lines.map((line, i) => {
          if (line.type === 'empty')
            return (
              <span key={i} className={styles.line} aria-hidden="true">
                {' '}
              </span>
            );
          return (
            <span key={i} className={`${styles.line} ${styles[line.type]}`}>
              {(line.tokens ?? []).map((tok, j) => (
                <span key={j} className={styles[tok.kind]}>
                  {tok.value}
                </span>
              ))}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
```

CSS palette (matches legacy `case-avsb.html` inline `<style>`):

- `.mock` — `background: #0f0e0d; color: #d7d2cb; border-radius: 6px; padding: clamp(24px, 3vw, 40px); font-family: var(--font-mono); font-size: clamp(1.2rem, 1.2vw, 1.5rem); line-height: 1.7; overflow: auto;`
- `.line` — `display: block;`
- `.comment` — `color: #7a756e;`
- `.prompt` — `color: var(--accent);`
- `.keyword` — `color: #9bb7d4;`
- `.value` — `color: #d4caa5;`
- `.string` — `color: #a4c490;`
- `.accent` — `color: #d4caa5;` (the inline accent gold for the `+2.4%` value in the AvsB stats line)
- `.response` — `color: #d7d2cb;`

The token colours are fixed in the SCSS module (not driven by `--accent` — see plan §Decisions).

### 6.10 `case/NextCase.tsx` — server

```tsx
import Link from 'next/link';
import { Arrow } from '../../../_components/Arrow/Arrow';
import type { NextCasePointer } from '../../../_types/case';
import styles from './_NextCase.module.scss';

export function NextCase({ pointer }: { pointer: NextCasePointer }) {
  return (
    <div className={styles.nextCase}>
      <Link href={`/work/${pointer.slug}`} className={styles.link} data-cursor="hover">
        <span className={styles.label}>{pointer.label}</span>
        <span className={styles.title}>{pointer.title}</span>
        <span className={styles.arrow} aria-hidden="true">
          <Arrow size={28} strokeWidth={1.4} />
        </span>
      </Link>
    </div>
  );
}
```

CSS:

- `.nextCase` — `padding-block: clamp(80px, 12vw, 160px); border-top: 1px solid var(--rule-strong);`
- `.link` — `display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 16px; text-decoration: none; color: inherit;`
- `.label` — `grid-column: 1 / 2; font-family: var(--font-mono); font-size: 1.15rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg-muted); margin-bottom: 16px;`
- `.title` — `grid-column: 1 / 2; font-family: var(--font-display); font-size: clamp(5rem, 9vw, 13rem); line-height: 0.92; font-weight: 500; text-transform: uppercase;`
- `.arrow` — `grid-column: 2 / 3; grid-row: 1 / 3; width: 80px; height: 80px; border: 1px solid var(--rule-strong); border-radius: 999px; display: grid; place-items: center; transition: transform 0.5s var(--ease-out), background-color 0.4s var(--ease-out), color 0.4s var(--ease-out), border-color 0.4s var(--ease-out);`
- Hover (`@include reduced-motion-safe`): `.title { color: var(--accent); }` `.arrow { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); transform: rotate(-45deg); }`
- ≤640px: arrow shrinks to 56px; title `clamp(4rem, 13vw, 6.4rem)`.

### 6.11 `case/Countries.tsx` — server

```tsx
import type { CountryCell } from '../../../_types/case';
import styles from './_Countries.module.scss';

export function Countries({ items }: { items: readonly CountryCell[] }) {
  return (
    <ul className={styles.countries} role="list">
      {items.map((c) => (
        <li key={c.flag} className={styles.country}>
          <span className={styles.flag}>{c.flag}</span>
          <span className={styles.name}>{c.name}</span>
        </li>
      ))}
    </ul>
  );
}
```

CSS:

- `.countries` — `display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 1px; background: var(--rule-strong); border: 1px solid var(--rule-strong); list-style: none; padding: 0; margin: 32px 0 0;`
- `.country` — `background: var(--bg); padding: clamp(20px, 2.4vw, 36px); display: flex; flex-direction: column; gap: 16px;`
- `.flag` — `font-family: var(--font-mono); font-size: 1.25rem; text-transform: uppercase; color: var(--accent); letter-spacing: 0.08em;`
- `.name` — `font-family: var(--font-display); font-size: clamp(2rem, 2.4vw, 2.8rem); text-transform: uppercase; font-weight: 500; line-height: 1;`
- ≤900px: 3-column grid.
- ≤640px: 2-column grid; `.country` padding `18px`.

### 6.12 `case/CaseImage.tsx` — server (flat)

```tsx
import Image from 'next/image';
import styles from './_CaseVisuals.module.scss';

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export function CaseImage({ src, alt, width, height, caption }: Props) {
  return (
    <figure className={styles.single}>
      <Image src={src} alt={alt} width={width} height={height} className={styles.slotImage} />
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
```

Used when an MDX body inlines a real image (post-Phase 6). Reuses `_CaseVisuals.module.scss` for the figure / caption styling so the visual rhythm matches.

## 7. The three case MDX files

### 7.1 `app/work/avsb/content.mdx`

```mdx
export const frontmatter = {
  slug: 'avsb',
  num: '01',
  title: 'AvsB',
  pageTitle: 'AvsB — Experimentation Platform · Mainul Islam',
  pageDescription: 'An in-house, CLI-driven A/B testing platform — built from scratch.',
  heroLines: [
    { text: 'AvsB', style: 'plain', trailingAccentDot: true },
    { text: 'Experiments,', style: 'outline' },
    { text: 'in code.', style: 'plain' },
  ],
  summary:
    'An in-house experimentation platform — similar in spirit to Optimizely, but CLI-driven and built for developers who want to write and manage experiments directly in code.',
  meta: [
    { label: 'Role', value: 'Sole\ndeveloper' },
    { label: 'Type', value: 'Own\nproduct' },
    { label: 'Year', value: '2025 –\nPresent' },
    { label: 'Status', value: 'In progress', accentDot: true },
  ],
  next: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
  footerHeading: 'Got something to test?',
};

<CaseBlock num="01" label="Overview" heading="What it is">
  AvsB is a **CLI-driven experimentation platform** — similar in spirit to Optimizely, but
  without a visual editor. It&rsquo;s built for developers who want to write and manage
  experiments directly in code, where they belong.

Visual A/B testing tools are powerful for marketers, but slow and limiting for engineering
teams. AvsB swaps that model for something <span className="accent">code-first,
version-controlled, and fast to ship.</span>

</CaseBlock>

<CaseBlock num="02" label="My role" heading="What I did">
  **Sole developer.** I designed and built the platform itself — not just tests running on
  top of someone else&rsquo;s tool.

- Architecture and platform design
- The CLI workflow and developer experience
- Data pipeline and event ingestion
- Frontend dashboard for results and analysis
  </CaseBlock>

<CaseBlock num="03" label="The problem" heading="What it solves">
  Visual A/B testing tools are slow and limiting for developers — clicks for what should
  be code, flaky DOM selectors, brittle rollouts, no version control.

AvsB starts from a different premise: experiments are **code, reviewed and shipped like
any other code.** Fast to write, easy to read, no GUI in the way.

</CaseBlock>

<CaseVisuals
  layout="single-plus-secondary"
  primary={{ caption: 'CLI example · ship a test in 3 commands', aspect: '16/10' }}
  secondary={{ caption: 'Dashboard · in-progress', aspect: '4/3' }}
>
  <CodeMock
    lines={[
      { type: 'comment', tokens: [{ kind: 'comment', value: '# Spin up a new experiment' }] },
      {
        type: 'prompt',
        tokens: [
          { kind: 'prompt', value: '$ ' },
          { kind: 'keyword', value: 'avsb new ' },
          { kind: 'text', value: 'checkout-cta-color' },
        ],
      },
      {
        type: 'response',
        tokens: [{ kind: 'text', value: '  ✓ created experiments/checkout-cta-color/' }],
      },
      {
        type: 'response',
        tokens: [{ kind: 'text', value: '  ✓ scaffolded control.ts + variant-a.ts' }],
      },
      { type: 'empty' },
      {
        type: 'prompt',
        tokens: [
          { kind: 'prompt', value: '$ ' },
          { kind: 'keyword', value: 'avsb ship ' },
          { kind: 'text', value: 'checkout-cta-color ' },
          { kind: 'value', value: '--traffic 50' },
        ],
      },
      { type: 'response', tokens: [{ kind: 'text', value: '  ✓ build passed' }] },
      { type: 'response', tokens: [{ kind: 'text', value: '  ✓ allocation written' }] },
      {
        type: 'response',
        tokens: [
          { kind: 'text', value: '  ✓ live · 50% traffic · ' },
          { kind: 'string', value: '"https://avsb.dev/e/cta-color"' },
        ],
      },
      { type: 'empty' },
      {
        type: 'prompt',
        tokens: [
          { kind: 'prompt', value: '$ ' },
          { kind: 'keyword', value: 'avsb stats ' },
          { kind: 'text', value: 'checkout-cta-color' },
        ],
      },
      {
        type: 'response',
        tokens: [
          { kind: 'text', value: '  variant-a · ' },
          { kind: 'accent', value: '+2.4%' },
          { kind: 'text', value: ' conv · n=14,820 · p=0.07' },
        ],
      },
    ]}
  />
</CaseVisuals>

<CaseBlock num="04" label="What I built" heading="The approach">
  A command-line workflow for creating, shipping, and analysing experiments, backed by the
  data pipeline and dashboard needed to make it useful.

- **CLI-first workflow** — `avsb new / ship / stats` handles the full lifecycle.
- **Code as the source of truth** — every variant lives in your repo, reviewed in PRs.
- **Event pipeline** built on ClickHouse for fast aggregation across millions of rows.
- **Cloudflare R2** for low-cost asset hosting and edge delivery.
- **Dashboard** for non-engineers — read-only results, no buttons that can break a test.
  </CaseBlock>

<CaseBlock num="05" label="Stack" heading="Tools used">
  Chosen for speed of iteration and a hosting model that stays cheap as event volume grows.

- Next.js
- TypeScript
- ClickHouse
- Cloudflare R2
- Node.js (CLI)
- SCSS
  </CaseBlock>

<CaseBlock num="06" label="Outcome" heading="Status">
  Currently in active development as my main product. The platform is being dog-fooded internally on
  a handful of small experiments while the public API stabilises.
</CaseBlock>
```

Notes:

- The `frontmatter` export must be a plain object literal (no spreads, no function calls). Next.js's MDX loader parses module-level named exports statically; runtime expressions break the static analysis.
- `validateFrontmatter(frontmatter)` is called inside `CaseLayout` at render time — author errors fail at first build/dev compile.
- The Stack block uses an MDX list rather than the Tags primitive because the visual treatment is "·-marked vertical list," not the chip pill that `<Tag>` renders.

### 7.2 `app/work/kemon-doctor/content.mdx`

```mdx
export const frontmatter = {
  slug: 'kemon-doctor',
  num: '02',
  title: 'Kemon Doctor',
  pageTitle: 'Kemon Doctor — Doctor Review Platform · Mainul Islam',
  pageDescription: 'A non-profit platform helping patients in Bangladesh find trustworthy doctors.',
  heroLines: [
    { text: 'Kemon', style: 'plain' },
    { text: 'Doctor.', style: 'accent' },
    { text: 'For real trust.', style: 'outline' },
  ],
  summary:
    '“Kemon Doctor” means How is the doctor? — a non-profit platform helping patients in Bangladesh find reliable doctors and surface issues like over-prescribing.',
  meta: [
    { label: 'Role', value: 'Solo founder\n& developer' },
    { label: 'Type', value: 'Non-profit\nproduct' },
    { label: 'Year', value: '2025 –\nPresent' },
    { label: 'Status', value: 'In progress', accentDot: true },
  ],
  next: { label: 'Next case · 03', title: 'Client Work', slug: 'client' },
  footerHeading: 'Working on something similar?',
};

<CaseBlock num="01" label="Overview" heading="What it is">
  Kemon Doctor (**“How is the doctor?”** in Bangla) is a non-profit platform helping patients
  in Bangladesh find reliable doctors — and quietly surface issues like over-prescribing and
  rushed consultations.

It&rsquo;s not a clinic-listing directory. It&rsquo;s a <span className="accent">trust
layer</span> on top of what already exists, built for the country it serves.

</CaseBlock>

<CaseBlock num="02" label="My role" heading="What I did">
  **Solo founder and developer.** Everything from the conceptual model to the production
  frontend is mine.

- Architecture and data model
- Frontend in Next.js 15 + TypeScript
- Database design and migration system (Drizzle ORM)
- Bilingual UX system (Bangla & English) treated with equal care
  </CaseBlock>

<CaseBlock num="03" label="The problem" heading="What it solves">
  Patients in Bangladesh have **no trusted, structured way** to judge a doctor before a
  visit. Word of mouth is the default, and over-prescribing is widespread.

The platform gives patients a place to share what actually happened in a consultation —
and to find doctors whose patterns hold up under it.

</CaseBlock>

<CaseVisuals
  layout="triple"
  items={[
    { caption: 'Search · mobile', aspect: '3/5' },
    { caption: 'Doctor profile', aspect: '3/5' },
    { caption: 'Review flow', aspect: '3/5' },
  ]}
/>

<CaseBlock num="04" label="What I built" heading="The approach">
  A mobile-first platform **built for real conditions in Bangladesh** — older phones, patchy
  3G, mixed-language users. Performance and clarity over polish.

- **Mobile-first UI** sized for one-handed use on the slowest devices we expect.
- **Bangla & English** with full type care — not afterthought translation.
- **Server-rendered** with Next.js for fast first paint over slow networks.
- **Structured reviews** — small set of strong signals rather than open-text noise.
- **Drizzle ORM** for type-safe migrations on the Postgres schema.
  </CaseBlock>

<CaseBlock num="05" label="Stack" heading="Tools used">
  Picked for fast iteration alone and a free-tier-friendly stack that keeps a non-profit
  running cheaply.

- Next.js 15
- TypeScript
- PostgreSQL
- Drizzle ORM
- Tailwind CSS
- Vercel
  </CaseBlock>

<CaseBlock num="06" label="Outcome" heading="Status">
  The platform is currently in build. It&rsquo;s intentionally being shipped slowly — trust-driven
  products live or die on their first hundred reviews, so we&rsquo;d rather start small and curated
  than open the gates early.
</CaseBlock>
```

### 7.3 `app/work/client/content.mdx`

```mdx
export const frontmatter = {
  slug: 'client',
  num: '03',
  title: 'Client Experimentation Work',
  pageTitle: 'Client Experimentation Work · Mainul Islam',
  pageDescription:
    '4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients.',
  heroLines: [
    { text: 'Client', style: 'plain' },
    { text: 'experiments,', style: 'outline' },
    { text: 'at scale.', style: 'accent' },
  ],
  summary:
    'Four-plus years and 500+ A/B tests shipped on enterprise platforms — checkout-flow experiments, layout tests, and conversion optimization for ecommerce and SaaS clients.',
  meta: [
    { label: 'Role', value: 'Frontend dev\non testing' },
    { label: 'Type', value: 'Client\nwork' },
    { label: 'Span', value: '2019 –\nPresent' },
    { label: 'Reach', value: '6 countries\n+ counting' },
  ],
  next: { label: 'Back to · 01', title: 'AvsB', slug: 'avsb' },
  footerHeading: 'Need an experiment shipped?',
};

<CaseBlock num="01" label="Overview" heading="What it is">
  Four-plus years and **500+ experiments shipped** on enterprise platforms — checkout-flow
  tests, layout experiments, copy variants, and full-page redesigns for ecommerce and SaaS
  clients.

The work spans single-element tests through to <span className="accent">full checkout-flow
redesigns</span> shipped on Optimizely, Kameleoon and Qubit.

</CaseBlock>

<CaseBlock num="02" label="Where" heading="Six countries">
  <Countries
    items={[
      { flag: 'UK', name: 'United Kingdom' },
      { flag: 'IN', name: 'India' },
      { flag: 'SK', name: 'Slovakia' },
      { flag: 'AT', name: 'Austria' },
      { flag: 'AU', name: 'Australia' },
      { flag: 'CA', name: 'Canada' },
    ]}
  />
</CaseBlock>

<CaseBlock num="03" label="My role" heading="What I did">
  **Frontend developer on testing programs** — trusted with direct client access and
  responsibility for the experiment all the way through to launch.

- Translating designs and hypotheses into production-grade test variants
- QA across browsers, devices, and screen readers
- Working alongside designers, analysts and CRO strategists
- Owning the build → review → ship loop on each test
  </CaseBlock>

<CaseBlock num="04" label="How I work" heading="The approach">
  Tests aren&rsquo;t experiments if they&rsquo;re brittle. I write variant code the same way
  I&rsquo;d write production code — readable, defensive, and survivable on third-party sites
  I don&rsquo;t control.

- **Defensive selectors** that survive minor DOM changes
- **Performance budget** — no test should slow the page
- **QA across breakpoints** before allocation goes live
- **Clean rollbacks** baked into every variant
  </CaseBlock>

<CaseBlock num="05" label="Stack" heading="Tools used">
  - JavaScript - SCSS - Optimizely - Kameleoon - Qubit - Browser DevTools
</CaseBlock>

<CaseBlock num="06" label="Outcomes" heading="Results">
  Specific test results stay with the clients who paid for them. Where numbers can be shared
  — with the client&rsquo;s permission, anonymised — they&rsquo;ll appear here in time.

_Honesty is the point of this section. Real numbers land here only once a client signs off
on sharing them. No exceptions._

</CaseBlock>

<CaseBlock num="07" label="Confidentiality" heading="A note">
  Client names appear only with written permission. Test variants, internal data, and any
  work that isn&rsquo;t listed here stays confidential — permanently. That&rsquo;s how this
  work has to work.

For new engagements, I&rsquo;m happy to walk through the _kinds_ of problems I&rsquo;ve
solved and the platforms I&rsquo;ve shipped on. If a former client has agreed to act as a
reference, I&rsquo;ll connect you with them directly.

  <a href="mailto:m.main2402@gmail.com" className="btn btnGhost">Talk about a new project →</a>
</CaseBlock>
```

Note the Client case is 7 blocks (the legacy fuses Outcomes + Confidentiality differently in the source; the spec splits them so reveal stagger reads cleanly). The `Where` block (02) hosts the `<Countries>` grid as its body — `CaseBlock` accepts any children, so structural variation is free.

The ghost-button anchor uses the global `.btn` + `.btnGhost` classes from Phase 3's `<Button>` styling. Verify the global selectors are exposed (they're scoped to the Button module today). If they aren't, the spec falls back to a small `<a className={styles.ghostCta}>…</a>` in `_CaseBlock.module.scss` styled inline.

## 8. Filters + IndexRow integration

`WorkIndexClient` filters by `categories.includes(active)`. The filter mapping:

- `all` — show all 6
- `product` — AvsB, Kemon Doctor (`categories.includes('product')`)
- `experimentation` — AvsB, Client Experiments (`categories.includes('experimentation')`)
- `client` — Client Experiments, Flatwhite, Crypto Gods, Pascal (`categories.includes('client')`)

Counter: `String(visible.length).padStart(2, '0')`.

Default active filter: `all`. State is `useState<WorkFilterValue>('all')`. No URL persistence (plan §Decisions).

## 9. Behaviour port — what's new in JS

| Behaviour                       | Source                       | Port                                                                                                                                 |
| ------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Filter row + counter            | `work.html:286–303`          | React state in `WorkIndexClient`. No `display: none`. `aria-live="polite"` announces count changes.                                  |
| Index row hover (shift + arrow) | `work.html:51–88`            | Pure CSS transitions in `_IndexRow.module.scss`. Wrapped in `@include reduced-motion-safe`.                                          |
| Case-block reveal stagger       | `shared.js:9–24` (Phase 3)   | `<Reveal>` per block; `delay` cycles 1 → 2 → 3 (CaseLayout doesn't set delay; defaults to none, blocks set it themselves if needed). |
| Next-case arrow rotation        | `shared.css` `.next-case`    | CSS transition on `transform: rotate(-45deg)` + colour shift. Reduced-motion-safe.                                                   |
| Breadcrumb back-link            | `case-*.html` `.crumb` block | `<Link href="/work">Work</Link>` in `<CaseHero>`.                                                                                    |

## 10. Accessibility checklist

- `<ol>` for the index row list with `role="list"` (Safari quirk insurance after `list-style: none`).
- Each filter chip is `<button type="button" aria-pressed={…}>` so screen readers announce selection state.
- The counter span uses `aria-live="polite"` so filter changes are announced without interrupting.
- `<CaseHero>` is wrapped in `<header>` and the title is the page's `<h1>`.
- `<CaseBlock>` heading is `<h2>` (one h1, then h2 per block; no skipped levels).
- `<CaseMeta>` uses `<dl> / <dt> / <dd>` for true label/value semantics.
- The status accent dot in `<CaseMeta>` is `aria-hidden="true"` (decorative; the word "In progress" carries meaning).
- `<NextCase>` is a single `<Link>` covering label + title + arrow — one focus stop, not three.
- `<CodeMock>` is `<pre><code>` with `aria-label="Example terminal session"` so screen readers describe the region. Token spans are visual-only and don't get aria roles.
- `<Countries>` is a `<ul role="list">` with one `<li>` per country.
- The MDX `<a>` override sets `target="_blank" rel="noopener noreferrer"` on external links; internal links use `next/link`; `mailto:` uses plain `<a>` with no target.
- Reveal-on-scroll wraps `Reveal` per block. `prefers-reduced-motion: reduce` keeps content visible and skips the translate/opacity tween (Phase 3 already implements this).
- Index-row title shift, next-case arrow rotation, and country-cell hover lift are all `@include reduced-motion-safe`.
- Touch targets: filter chips ≥44×44 CSS pixels via padding; next-case arrow circle is 80px (56px on phone — well above the 44px floor); index-row link is the entire row (always ≥44px tall).
- Visible focus on all interactive elements — no `outline: none` overrides anywhere in this phase.
- Lighthouse a11y target on `/work` + each `/work/<slug>` = 100.

## 11. Responsive breakpoints (per-component)

| Breakpoint | `/work` index                                                                                                | Case study pages                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| ≤1100px    | Title shrinks; row padding tightens.                                                                         | Hero title clamp pulls down; case-block grid stays 2-col.                                                                        |
| ≤900px     | Row grid → 2 cols (`32px 1fr`); title/meta/tags/year/arrow stack in col 2.                                   | Case-block grid → single col (`.side` becomes static, no longer sticky). CaseVisuals `duo` → single column.                      |
| ≤768px     | (no change beyond ≤900)                                                                                      | (no change)                                                                                                                      |
| ≤700px     | (no change)                                                                                                  | (no change)                                                                                                                      |
| ≤640px     | Title `3.2rem`; arrow circle 36px; padding `22px 0`. Filter row label becomes block; count moves to new row. | Hero title floor `5.4rem`. Meta strip stays 2×2 (drops Span/Reach to second row). NextCase arrow → 56px. Countries → 2-col grid. |
| ≤380px     | Title floor `2.8rem`; tags `0.95rem`.                                                                        | Hero title floor `4.8rem`. Meta strip → 1-column stack. CaseBlock body `1.6rem`.                                                 |
| 320px      | Hard guardrail — verify Flatwhite row tag list fits on iPhone SE 1st gen.                                    | Hard guardrail — verify each case hero title doesn't overflow.                                                                   |

## 12. Verification checklist

Run before marking complete:

1. `npm run build` — clean.
2. `npx tsc --noEmit` — clean. The MDX named-import shim resolves.
3. `npm run lint` — clean.
4. `npm run dev` — visit each of the 4 routes (`/work`, `/work/avsb`, `/work/kemon-doctor`, `/work/client`). Each renders end-to-end without console errors.
5. Filter row: click each chip; row count updates; the right rows show.
6. Case hero treatments: AvsB has accent dot on line 1 + outline on line 2; Kemon has accent on line 2 + outline on line 3; Client has outline on line 2 + accent on line 3.
7. Meta strip: AvsB / Kemon last cell has pulsing accent dot. Client has `Span` / `Reach` labels in the last two cells.
8. CodeMock: token colours render (comment grey, prompt accent, keyword blue-grey, value gold, string olive); `+2.4%` is the accent gold.
9. NextCase pager: AvsB → Kemon → Client → AvsB (wrap). Client's label reads `Back to · 01`.
10. Per-case footer headings render correctly.
11. Home `/` → `SelectedWork` rows: clicking each lands on the matching case page (no 404).
12. Keyboard pass: tab through `/work` (filter chips + 6 rows + confidentiality) and one case page (breadcrumb + 6+ block focus stops + next-case + footer links). Focus order matches visual order.
13. VoiceOver pass: filter chips announce selected state; counter announces the new total on filter change; case-block headings announce as h2s; next-case link reads "Next case · 02, Kemon Doctor, link."
14. `prefers-reduced-motion: reduce` (DevTools → Rendering): row title shift, next-case arrow rotation, country hover, reveal transforms all skip. Final visual identical.
15. Mobile: 320px viewport via DevTools — case hero titles fit, index row title doesn't overflow, filter row wraps cleanly.
16. Lighthouse mobile a11y on `/work` and `/work/avsb` = 100.
17. `futureWorks.md` Resolved gains the `[routes] SelectedWork 404s` entry; Open gains `[assets] real case-study screenshots` if not already there.

## 13. Open questions / explicit assumptions

- **MDX `frontmatter` named export resolves under `@next/mdx`@^3.1.1.** If not, fall back to YAML frontmatter via `remark-frontmatter` (one new dev dep). Spec confirms this on first dev compile during implementation.
- **The home `<Button>` `.btn` `.btnGhost` `.btnAccent` class names are scoped to the Button module** today (CSS Modules). The Client case's `<a className="btn btnGhost">…</a>` inline needs either (a) Phase 3's Button to expose `:global` selectors for these classes, (b) the Client case to import and use the actual `<Button>` component, or (c) `_CaseBlock.module.scss` to define its own `.ghostCta` styling. Default during implementation: option (b) — render `<Button href="mailto:…" variant="ghost" external>Talk about a new project</Button>` in the JSX-friendly slot. Means the Client case adds a top-of-file `import { Button } from …` line. Acceptable for one case.
- **`futureWorks.md:14` (additionalData not applied) stays unresolved.** This phase follows the per-file `@use` workaround Phases 3–5 already use.
- **Image `width`/`height` defaults in the `img` override** are `1200` × `800`. These are placeholder defaults — real markdown images (none in Phase 6) should use `<CaseImage>` explicitly.
