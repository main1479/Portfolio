# Experience detail pages — technical spec

Pair: `_plans/experience-pages-plan.md`.

## Overview

Build two new pages under `/experience/[slug]` reusing the existing case-study primitives (`CaseHero`, `CaseMeta`, `CaseBlock`, `Countries`) under a new `ExperienceLayout` that drops both the case-chain pager and the breadcrumb entirely. (No `/experience` index page exists by design — see plan — so a breadcrumb has nowhere honest to link back to.) Delete the `/work/client` case study. Renumber remaining work entries 01–05. Make homepage Experience rows clickable.

## Routes

| Path                          | Status                                 |
| ----------------------------- | -------------------------------------- |
| `/experience/client`          | **new** — freelance frontend tenure    |
| `/experience/gain-conversion` | **new** — Conversion.com A/B testing   |
| `/work/client`                | **deleted**                            |
| `/work/avsb`                  | unchanged content, `num: "01"`         |
| `/work/kemon-doctor`          | unchanged content, `num: "02"`         |
| `/work/radius`                | unchanged content, `num: "03"`         |
| `/work/cursimax`              | unchanged content, **renumbered `04`** |
| `/work/flatwhite`             | unchanged content, **renumbered `05`** |

## File-level changes

### New files

```
app/experience/
├── _components/
│   └── ExperienceLayout/
│       ├── ExperienceLayout.tsx
│       └── _ExperienceLayout.module.scss   — body wrapper styles (mirrors _CaseLayout.module.scss .body)
├── client/
│   ├── content.mdx                    — freelance frontend MDX
│   └── page.tsx                       — server component, mirrors app/work/avsb/page.tsx
└── gain-conversion/
    ├── content.mdx                    — Conversion.com MDX
    └── page.tsx                       — server component, same shape

app/_types/experience.ts               — ExperienceFrontmatter type
app/experience/_components/ExperienceLayout/experience-frontmatter-schema.ts  — Zod schema
```

### Edited files

```
app/_lib/work-projects.ts              — remove `client` entry; renumber cursimax `04`→ keep num, but adjust order/num strings to fill the gap
app/_lib/case-registry.ts              — remove `client` link; chain becomes avsb → kemon-doctor → radius → cursimax → flatwhite → avsb
app/_lib/home-content.ts               — add `href` to each experience.items entry
app/_types/home.ts                     — add optional `href?: string` to XpItem
app/_components/Experience/XpRow.tsx   — render as <Link> when item.href is set; keep <div> shape otherwise
app/_components/Experience/_Experience.module.scss  — focus / hover states for the link variant
app/work/cursimax/content.mdx          — frontmatter num "05" → "04", next pointer slug "flatwhite" stays
app/work/flatwhite/content.mdx         — frontmatter num "06" → "05", next pointer (currently flatwhite → back to avsb) stays
app/work/radius/content.mdx            — frontmatter `next` was `{ slug: 'client', ... }` → change to `{ slug: 'cursimax', label: 'Next case · 04', title: 'Cursimax' }`
app/sitemap.ts                         — drop /work/client; add /experience/client and /experience/gain-conversion
```

### Deleted files

```
app/work/client/                       — page.tsx, content.mdx, opengraph-image.tsx, twitter-image.tsx, entire directory
```

## Component design

### `ExperienceLayout`

Sibling to `CaseLayout` but smaller. Lives in `app/experience/_components/ExperienceLayout/`.

```tsx
type Props = {
  frontmatter: ExperienceFrontmatter;
  children: React.ReactNode;
};

export function ExperienceLayout({ frontmatter, children }: Props) {
  const fm = validateExperienceFrontmatter(frontmatter);
  return (
    <>
      <CaseHero lines={fm.heroLines} summary={fm.summary} />
      <Container>
        <CaseMeta cells={fm.meta} />
      </Container>
      <div className={styles.body}>
        <Container>{children}</Container>
      </div>
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

Imports (omitted from the snippet for brevity): `Container` from `app/_components/Container/Container`, `Footer` from `app/_components/Footer/Footer`, `CaseHero`/`CaseMeta` from `app/work/_components/case/`, schema + styles colocated.

Differences from `CaseLayout`:

- No `NextCase` pager. Experience pages don't chain.
- No `getNextCase` registry call.
- No breadcrumb. CaseHero is called with only `lines` and `summary` — see CaseHero refactor below.

### `CaseHero` — make the breadcrumb optional

Experience pages render no breadcrumb (there's no `/experience` index to link back to). The minimal change is to make `num` and `breadcrumbTitle` both optional, and skip the breadcrumb `<p>` when both are absent. The hardcoded `/work` Link stays — only `/work/<slug>` pages ever render the breadcrumb, so no `breadcrumbRoot` prop is needed.

```diff
- type Props = { num: string; breadcrumbTitle: string; lines; summary };
+ type Props = {
+   /** Both optional — when both are omitted, no breadcrumb is rendered. */
+   num?: string;
+   breadcrumbTitle?: string;
+   lines: readonly CaseHeroLine[];
+   summary: string;
+ };
```

In the JSX, wrap the breadcrumb so it's skipped when there's nothing to show:

```diff
- <p className={styles.breadcrumb}>
-   <Link href="/work">Work</Link>
-   <span aria-hidden="true"> / </span>
-   <span className={styles.breadcrumbCurrent}>
-     {num} — {breadcrumbTitle}
-   </span>
- </p>
+ {breadcrumbTitle && (
+   <p className={styles.breadcrumb}>
+     <Link href="/work">Work</Link>
+     <span aria-hidden="true"> / </span>
+     <span className={styles.breadcrumbCurrent}>
+       {num ? `${num} — ${breadcrumbTitle}` : breadcrumbTitle}
+     </span>
+   </p>
+ )}
```

`CaseLayout` calls remain unchanged (`num={fm.num} breadcrumbTitle={fm.title}`). `ExperienceLayout` passes neither. The four existing `/work/<slug>` pages are untouched.

### Frontmatter type + schema

`app/_types/experience.ts`:

```ts
import type { CaseHeroLine, CaseMetaCell } from './case';

export type ExperienceFrontmatter = {
  slug: 'client' | 'gain-conversion';
  title: string;
  pageTitle: string;
  pageDescription: string;
  heroLines: readonly CaseHeroLine[];
  summary: string;
  meta: readonly CaseMetaCell[]; // 4 cells, same as case studies
  footerHeading: string;
};
```

`app/experience/_components/ExperienceLayout/experience-frontmatter-schema.ts`:

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

export const experienceFrontmatterSchema = z.object({
  slug: z.enum(['client', 'gain-conversion']),
  title: z.string().min(1),
  pageTitle: z.string().min(1),
  pageDescription: z.string().min(1),
  heroLines: z.array(caseHeroLine).min(1).max(4),
  summary: z.string().min(1),
  meta: z.array(caseMetaCell).length(4),
  footerHeading: z.string().min(1),
});

export function validateExperienceFrontmatter(input: unknown) {
  return experienceFrontmatterSchema.parse(input);
}
```

The `caseHeroLine` and `caseMetaCell` shapes are duplicated verbatim from `case-frontmatter-schema.ts` rather than imported. Acceptable for two-pager scope; keeps the experience schema independent if either evolves. No `num` or `next` fields — experience pages don't render a breadcrumb num and don't chain.

## MDX content

### `app/experience/client/content.mdx`

```mdx
export const frontmatter = {
  slug: 'client',
  title: 'Freelance Frontend',
  pageTitle: 'Freelance Frontend · Mainul Islam',
  pageDescription:
    'Freelance frontend work since 2019 — production builds for startups and individuals across nine-plus countries.',
  heroLines: [
    { text: 'Freelance', style: 'plain' },
    { text: 'frontend,', style: 'outline' },
    { text: 'on the road.', style: 'accent' },
  ],
  summary:
    'Frontend builds for startups, founders, and small teams across nine-plus countries — pure frontend work, paid hourly or by project.',
  meta: [
    { label: 'Role', value: 'Freelance\nfrontend dev' },
    { label: 'Type', value: 'Personal\nclients' },
    { label: 'Span', value: '2019 –\nPresent' },
    { label: 'Reach', value: '9 countries\n+ counting' },
  ],
  footerHeading: 'Have a build in mind?',
};

<CaseBlock num="01" label="Overview" heading="What it is">
  Independent frontend work since 2019. Builds for founders, small teams, and startups — HTML, SCSS,
  JavaScript, TypeScript, React, Next.js. Figma and XD into production code, mobile-first and
  accessible.
</CaseBlock>

<CaseBlock num="02" label="Where" heading="Nine countries, and counting">
  <Countries
    items={[
      { flag: 'UK', name: 'United Kingdom' },
      { flag: 'IN', name: 'India' },
      { flag: 'SK', name: 'Slovakia' },
      { flag: 'AT', name: 'Austria' },
      { flag: 'AU', name: 'Australia' },
      { flag: 'CA', name: 'Canada' },
      { flag: 'RO', name: 'Romania' },
      { flag: 'IT', name: 'Italy' },
      { flag: 'MX', name: 'Mexico' },
    ]}
  />
  A few more aren't listed — long-finished engagements, paperwork lost, or clients who'd rather not
  be named.
</CaseBlock>

<CaseBlock num="03" label="Named projects" heading="A few you can look at">

- [Cursimax](/work/cursimax) — Spanish-language e-learning marketplace
- [Flatwhite](/work/flatwhite) — Romanian rentals & property-management
- Lenoir App — browser-based iPad OS apps
- ScalingLab — founder website for Theodore Mollinger
- Azzeroco — Italian sustainability brand

</CaseBlock>

<CaseBlock num="04" label="How I work" heading="The approach">

- **Designs to production code** — Figma and XD straight through to built pages
- **Mobile-first** — small screens before large
- **Accessible by default** — semantic HTML, keyboard nav, contrast checked
- **Performance-conscious** — fast first paint, lean dependency lists

</CaseBlock>

<CaseBlock num="05" label="Stack" heading="Tools used">

- HTML, SCSS
- JavaScript, TypeScript
- React, Next.js

</CaseBlock>
```

### `app/experience/gain-conversion/content.mdx`

```mdx
export const frontmatter = {
  slug: 'gain-conversion',
  title: 'A/B Testing at Conversion.com',
  pageTitle: 'A/B Testing at Conversion.com · Mainul Islam',
  pageDescription:
    '4+ years building production A/B tests for agency clients via Conversion.com — Optimizely, Kameleoon, Qubit, and more.',
  heroLines: [
    { text: 'A/B testing', style: 'plain' },
    { text: 'at Conversion.com,', style: 'outline' },
    { text: 'at enterprise scale.', style: 'accent' },
  ],
  summary:
    'Long-running contract with Conversion.com — 4+ years and 500+ A/B tests shipped on enterprise platforms for ecommerce, SaaS, publishing, automotive, and non-profit clients.',
  meta: [
    { label: 'Role', value: 'Frontend dev\non testing' },
    { label: 'Org', value: 'Conversion\n.com' },
    { label: 'Span', value: '2022 –\nPresent' },
    { label: 'Reach', value: '500+ tests\nshipped' },
  ],
  footerHeading: 'Want to talk?',
};

<CaseBlock num="01" label="Overview" heading="What it is">
  A long-running contract with Conversion.com — production A/B tests in JavaScript,
  TypeScript, and SCSS on enterprise experimentation platforms. **500+ tests shipped**
  across checkout flows, layout experiments, copy variants, and full-page redesigns.

The work spans single-element tests through <span className="accent">full checkout-flow redesigns</span>.
I also built [Radius](/work/radius) — Conversion.com's internal insights & experiments platform.

</CaseBlock>

<CaseBlock num="02" label="Platforms" heading="Where the tests run">

- Optimizely
- Kameleoon
- Qubit
- AB Tasty
- VWO
- Adobe Target
- Google Optimize

</CaseBlock>

<CaseBlock num="03" label="Clients" heading="Brands I've shipped tests for">
  - **The Times** — news & publishing
  - **G-Star RAW** — fashion
  - **Motorway** — automotive
  - **Unity** — gaming & SaaS
  - **Ironmongery Direct** — ecommerce
  - **WaterAid** — non-profit
  - **AdBlock** — browser tech
  - **Deel** — HR & SaaS

— and many, many more.

</CaseBlock>

<CaseBlock num="04" label="My role" heading="What I do">
  **Frontend developer on testing programs** — direct client access, ownership through to launch.

- Translating designs and hypotheses into production-grade test variants
- QA across browsers, devices, and screen readers
- Working alongside designers, analysts, and CRO strategists
- Owning the build → review → ship loop on each test
  </CaseBlock>

<CaseBlock num="05" label="How I work" heading="The approach">
  Tests aren't experiments if they're brittle. I write variant code the same way I'd write
  production code — readable, defensive, and survivable on third-party sites I don't control.

- **Resilient selectors** that survive minor DOM changes
- **Performance budget** — no test should slow the page
- **QA across breakpoints** before allocation goes live
- **Clean rollbacks** baked into every variant
  </CaseBlock>

<CaseBlock num="06" label="Stack" heading="Tools used">

- JavaScript, TypeScript
- SCSS
- Optimizely, Kameleoon, Qubit
- Browser DevTools

</CaseBlock>
```

Radius is referenced inline at the end of CaseBlock 01 ("I also built Radius…") with a Markdown link to `/work/radius`. mdx-components.tsx already wraps internal `/`-hrefs in `next/link`.

## Homepage wiring

`app/_types/home.ts` — add optional `href` to `XpItem`:

```ts
export type XpItem = {
  year: string;
  roleLines: readonly string[];
  at?: string;
  desc: string;
  loc: string;
  href?: string;
};
```

`app/_lib/home-content.ts` — add hrefs:

```diff
  experience: {
    sectionIndex: '06 / Experience',
    items: [
      {
        year: '2022 – Present',
        roleLines: ['Frontend Developer', '(A/B Testing)'],
        at: '@ Conversion.com',
        desc: '...',
        loc: 'Remote · UK',
+       href: '/experience/gain-conversion',
      },
      {
        year: '2019 – Present',
        roleLines: ['Freelance Frontend', 'Developer'],
        desc: '...',
        loc: 'Remote · 9+ countries',
+       href: '/experience/client',
      },
    ],
  },
```

`app/_components/Experience/XpRow.tsx` — conditional wrapper. The shape is the same as today; only difference is that the row optionally renders as `<Link>` when `item.href` is set. **Important:** the `<h3 className={styles.role}>` body in the snippet below is collapsed to `...` for brevity — the implementer must preserve the existing `item.roleLines.map(...)` + optional `<br/>` + `item.at` span rendering verbatim from the current file.

```tsx
import Link from 'next/link';
import type { XpItem } from '../../_types/home';
import styles from './_Experience.module.scss';

export function XpRow({ item }: { item: XpItem }) {
  const body = (
    <>
      <div className={styles.year}>{item.year}</div>
      <h3 className={styles.role}>
        {/* existing roleLines.map + <br/> + optional at span — unchanged */}
        ...
      </h3>
      <p className={styles.desc}>{item.desc}</p>
      <div className={styles.loc}>{item.loc}</div>
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`${styles.row} ${styles.rowLink}`}
        aria-label={`Read about my time as ${item.roleLines.join(' ')}${item.at ? ` ${item.at}` : ''}`}
      >
        {body}
      </Link>
    );
  }
  return <div className={styles.row}>{body}</div>;
}
```

`_Experience.module.scss` — add `.rowLink`:

```scss
.rowLink {
  text-decoration: none;
  color: inherit;
  outline: 0;

  @media (prefers-reduced-motion: no-preference) {
    transition: background 0.18s ease;
  }

  &:hover {
    background: var(--paper);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }
}
```

(Exact tokens — paper, accent — already present in `_variables.scss`.)

## Renumbering / case-registry

`app/_lib/case-registry.ts`:

```diff
- avsb: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
- 'kemon-doctor': { label: 'Next case · 03', title: 'Radius', slug: 'radius' },
- radius: { label: 'Next case · 04', title: 'Client Work', slug: 'client' },
- client: { label: 'Next case · 05', title: 'Cursimax', slug: 'cursimax' },
- cursimax: { label: 'Next case · 06', title: 'Flatwhite', slug: 'flatwhite' },
- flatwhite: { label: 'Back to · 01', title: 'AvsB', slug: 'avsb' },
+ avsb: { label: 'Next case · 02', title: 'Kemon Doctor', slug: 'kemon-doctor' },
+ 'kemon-doctor': { label: 'Next case · 03', title: 'Radius', slug: 'radius' },
+ radius: { label: 'Next case · 04', title: 'Cursimax', slug: 'cursimax' },
+ cursimax: { label: 'Next case · 05', title: 'Flatwhite', slug: 'flatwhite' },
+ flatwhite: { label: 'Back to · 01', title: 'AvsB', slug: 'avsb' },
```

`app/_lib/work-projects.ts` — three changes:

1. **Delete the entire `client` entry** (currently `num: '04'`, `order: 4`, `slug: 'client'`, `href: '/work/client'`, lines 60–73 of the current file). The whole object block goes.
2. **Renumber `cursimax`**: `num: '05' → '04'`, `order: 5 → 4`.
3. **Renumber `flatwhite`**: `num: '06' → '05'`, `order: 6 → 5`.

After the change, the array contains five entries with consecutive `num`/`order` 01–05: avsb, kemon-doctor, radius, cursimax, flatwhite. No other fields (title, summary, tags, year, type, yearStatus, hasCase, href) change on the kept entries.

MDX frontmatter `num`/`next` fields in `cursimax/content.mdx`, `flatwhite/content.mdx`, `radius/content.mdx` updated to match the new chain (cursimax becomes 04, flatwhite becomes 05, radius's `next` now points to cursimax).

The CaseLayout dev-only warning compares frontmatter.next.slug against the registry — both must agree.

## Sitemap

The current sitemap is missing `radius`, `cursimax`, and `flatwhite`. This PR drops `/work/client` and adds both experience routes _plus_ the three missing work slugs — cheap to do at the same time and keeps the sitemap honest.

Final array after this PR (in this order, all `lastModified: now`, `changeFrequency: 'monthly'`):

| URL                                  | Priority |
| ------------------------------------ | -------- |
| `${base}/`                           | 1.0      |
| `${base}/work`                       | 0.9      |
| `${base}/work/avsb`                  | 0.8      |
| `${base}/work/kemon-doctor`          | 0.8      |
| `${base}/work/radius`                | 0.8      |
| `${base}/work/cursimax`              | 0.8      |
| `${base}/work/flatwhite`             | 0.8      |
| `${base}/experience/client`          | 0.8      |
| `${base}/experience/gain-conversion` | 0.8      |
| `${base}/about`                      | 0.7      |
| `${base}/contact`                    | 0.7      |

(The `/work/client` row is removed entirely.)

## Pages — server component shape

Both `app/experience/<slug>/page.tsx` are minimal mirrors of `app/work/avsb/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Content, { frontmatter } from './content.mdx';
import { ExperienceLayout } from '../_components/ExperienceLayout/ExperienceLayout';

export const metadata: Metadata = {
  title: { absolute: frontmatter.pageTitle },
  description: frontmatter.pageDescription,
  alternates: { canonical: `/experience/${frontmatter.slug}` },
  openGraph: {
    type: 'article',
    url: `/experience/${frontmatter.slug}`,
    title: frontmatter.pageTitle,
    description: frontmatter.pageDescription,
  },
  twitter: {
    title: frontmatter.title,
    description: frontmatter.pageDescription,
  },
};

export default function ExperienceClientPage() {
  return (
    <ExperienceLayout frontmatter={frontmatter}>
      <Content />
    </ExperienceLayout>
  );
}
```

## Accessibility

- Homepage Experience rows: keyboard focus reaches each link; visible focus ring (`outline: 2px solid var(--accent)`). Touch target spans the full row, well above 44×44.
- `aria-label` on each link includes role + org so screen-reader users hear context, not just `<h3>` text.
- `<CaseHero>` h1 remains the only h1 per page; `<CaseBlock>` uses `<h2>`; existing case-study patterns carry over.
- Experience pages render no breadcrumb (see CaseHero refactor) — one fewer landmark for screen-reader users, but they're not arriving from a `/experience` index either, so nothing to navigate "back" to.
- All internal links go through `next/link`; mailto links stay `<a>`.

## Edge cases

- **MDX validation** — both experience MDX files load through `validateExperienceFrontmatter` at module-load time. Schema parse error throws on build, surfacing typos early.
- **Old `/work/client` URLs** — any inbound link breaks once the page is deleted. The site has no internal links to it after this PR; external inbound traffic gets a 404. Acceptable — site is pre-launch.
- **Reduced motion** — Experience rows reuse the existing `Reveal` wrapper which already respects `prefers-reduced-motion`. The new `.rowLink` hover transition is wrapped in `@media (prefers-reduced-motion: no-preference)` (see SCSS above), so reduced-motion users get the hover background but no transition.
- **Case-registry assertion** — CaseLayout's dev-only warning will fire if a frontmatter `next` doesn't match the registry. Both must move together when renumbering.

## Verification checklist

1. `npm run build` clean.
2. `npx tsc --noEmit` clean.
3. `npm run lint` clean.
4. `/experience/client` and `/experience/gain-conversion` render.
5. Homepage Experience rows are keyboard-focusable, click-through to the right pages.
6. `/work` index shows 5 entries 01–05, no gap.
7. `/work/avsb` → "Next case · 02" still points correctly; chain ends at `/work/flatwhite` → "Back to · 01".
8. `/work/client` returns 404.
9. Lighthouse accessibility audit on both new pages — target 100.
10. Tab through the homepage; no focus traps; visible ring on each Experience row.

## What I'm NOT doing (re-stated from the plan)

- No `/experience` index page.
- No top-nav entry for `/experience`.
- No OG/twitter images for the two new pages in this PR.
- No about-page or CV updates to reference the new experience routes.

## Branch + workflow

On `feature/experience-pages`. Spec lands in this commit; implementation follows in subsequent commits once approved.

Once `chore/copy-tweaks` (PR #21) merges, rebase this branch on main before pushing implementation commits — the copy fixes will already be in scope, so this branch only needs to add the new pages on top.
