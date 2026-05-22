# Spec — Home page (Phase 4)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch:** `feature/home-page`
**Plan:** `_plans/home-page-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 4 (lines 700–726), §5.2 (home composition), §7 (interactions), §11 (≤320px guardrail)
**Source of truth (markup):** `Mainul's Portfolio/index.html` (lines 861–1340)
**Source of truth (styles):** `Mainul's Portfolio/index.html` `<style>` block (lines 14–859) + `assets/shared.css`
**Source of truth (behaviours):** `Mainul's Portfolio/index.html` `<script>` block (lines 1343–1407) + `assets/shared.js`

---

## 0. Recap

Port the legacy home page into the live Next.js app. `/` becomes the full landing page: Hero with variant toggle, Marquee, Intro, Stats, Services, SelectedWork, SelectedClients, Recognition, Experience, EndCTA, and the floating TweaksPanel. Composition uses Phase 3 primitives wherever they fit; new home-only CSS lives in component modules.

> **Revision 2 (2026-05-22 evening) — see §17.** This phase now adds GSAP + ScrollTrigger as the motion system and a page loader to mask hydration. Sections 1, 3.4, 6.1, 6.7–6.8, 7, 13, 15, 16 are overridden by §17; the rest of the spec stands.

## 1. File tree

```
app/
├── page.tsx                                                    ← REWRITE (was 10-line placeholder)
├── _components/
│   └── home/                                                   ← NEW namespace
│       ├── _homePage.module.scss                               ← Page-level layout for app/page.tsx
│       ├── HomeShell/
│       │   ├── HomeShell.tsx                                   ← 'use client' — owns HomeStateContext
│       │   └── HomeStateContext.ts                             ← Context + provider/hook
│       ├── Hero/
│       │   ├── Hero.tsx                                        ← 'use client' — composes the hero
│       │   ├── HeroVariantA.tsx                                ← Server — three-line headline
│       │   ├── HeroVariantB.tsx                                ← Server — three-line headline
│       │   ├── HeroBadge.tsx                                   ← 'use client' — rotated chip, click toggles variant
│       │   └── _Hero.module.scss
│       ├── Marquee/
│       │   ├── Marquee.tsx                                     ← Server — pure CSS animation
│       │   └── _Marquee.module.scss
│       ├── Intro/
│       │   ├── Intro.tsx                                       ← Server — sticky label + body grid
│       │   └── _Intro.module.scss
│       ├── Stats/
│       │   ├── Stats.tsx                                       ← 'use client' — wraps countup hook
│       │   ├── Stat.tsx                                        ← 'use client' sub-component
│       │   └── _Stats.module.scss
│       ├── Services/
│       │   ├── Services.tsx                                    ← Server — three-column grid
│       │   ├── ServiceCard.tsx                                 ← Server — single card
│       │   └── _Services.module.scss
│       ├── SelectedWork/
│       │   ├── SelectedWork.tsx                                ← Server — list of WorkRow
│       │   ├── WorkRow.tsx                                     ← Server — single row
│       │   └── _SelectedWork.module.scss
│       ├── SelectedClients/
│       │   ├── SelectedClients.tsx                             ← Server — grid + intro
│       │   ├── ClientCard.tsx                                  ← Server
│       │   └── _SelectedClients.module.scss
│       ├── Recognition/
│       │   ├── Recognition.tsx                                 ← Server — two award cards
│       │   ├── AwardCard.tsx                                   ← Server
│       │   └── _Recognition.module.scss
│       ├── Experience/
│       │   ├── Experience.tsx                                  ← Server — two xp-rows
│       │   ├── XpRow.tsx                                       ← Server
│       │   └── _Experience.module.scss
│       ├── EndCTA/
│       │   ├── EndCTA.tsx                                      ← Server — giant outline heading + accent button
│       │   └── _EndCTA.module.scss
│       └── TweaksPanel/
│           ├── TweaksPanel.tsx                                 ← 'use client' — swatches + variant toggle
│           └── _TweaksPanel.module.scss
├── _lib/
│   ├── home-content.ts                                         ← NEW — all home copy in one object
│   ├── work-projects.ts                                        ← NEW — six WorkProject entries
│   ├── accent-swatches.ts                                      ← NEW — five swatch constants + validator
│   └── use-count-up.ts                                         ← NEW — count-up hook
└── _types/
    ├── home.ts                                                 ← NEW — types for home-content
    └── work.ts                                                 ← NEW — WorkProject type
```

**Counts:** 23 new files, 1 rewrite. No edits to chrome, tokens, or layout.tsx.

**No `index.ts` re-exports anywhere.** Every consumer imports the named file directly.

## 2. Type contracts

### 2.1 `app/_types/work.ts`

```ts
export type WorkProject = {
  /** Stable slug, kebab-case. Drives the `/work/[slug]` URL. */
  slug: string;
  /** Two-digit index displayed in the row. */
  num: string;
  /** Display title — uppercase rendering happens in CSS. */
  title: string;
  /** One-line summary; rendered as the row's primary description. */
  summary: string;
  /** Tag list, rendered with `·` separators in the row meta. */
  tags: readonly string[];
  /** Featured projects appear on the home `<SelectedWork>` list. */
  featured: boolean;
  /** Sort order on the `/work` index (Phase 6 reads this; Phase 4 ignores). */
  order: number;
  /** Optional: project year(s), shown on `/work` index (Phase 6). */
  year?: string;
  /** Optional: 'own' | 'client' | 'agency' — for `/work` filters in Phase 6. */
  type?: 'own' | 'client' | 'agency';
};
```

### 2.2 `app/_types/home.ts`

```ts
import type { WorkProject } from './work';

export type StatItem = {
  /** Numeric value to count up to. */
  value: number;
  /** Optional suffix (e.g. '+') rendered at 0.4em + accent colour. */
  suffix?: string;
  /** Label below the number. */
  label: string;
};

export type ServiceItem = {
  /** Two-digit ordinal, displayed bracketed: `[01]`. */
  num: string;
  /** Title with explicit line breaks rendered via JSX (array of strings). */
  titleLines: readonly [string, string];
  /** Body description. */
  desc: string;
  /** Tag pills under the description. */
  tags: readonly string[];
};

export type ClientItem = {
  /** Sector caption above the name. */
  sector: string;
  /** Brand name; supports a soft-break `<wbr>` if author writes it in. */
  name: string;
};

export type RecognitionItem = {
  /** Display label inside the seal (e.g. 'SOTD'). */
  sealText: string;
  /** Heading lines (rendered with `<br/>` between). */
  titleLines: readonly [string, string];
  /** Source publication name. */
  source: string;
  /** Date string ('Dec 2021'). */
  date: string;
  /** External href to the feature. */
  href: string;
};

export type XpItem = {
  /** Year range. */
  year: string;
  /** Role lines — array so JSX can render `<br/>` between. */
  roleLines: readonly string[];
  /** Optional company suffix, rendered with accent colour after the role. */
  at?: string;
  /** Body description. */
  desc: string;
  /** Location string. */
  loc: string;
};

export type HomeContent = {
  hero: {
    topbarLeft: { name: string; role: string };
    topbarRight: { version: string; year: string; metric: string };
    /** Sub-paragraph under the headline. */
    sub: string;
    /** Status line beside the live pulse dot. */
    statusLine: string;
    /** CTA button text. */
    ctaLabel: string;
    /** Internal href. */
    ctaHref: string;
  };
  marquee: {
    /** Tokens rendered between dots. `accent: true` paints the token with accent. */
    tokens: ReadonlyArray<{ label: string; accent?: boolean }>;
  };
  intro: {
    /** Mono label (top). */
    label: string;
    /** Sub-line in accent ('01 / Index'). */
    indexLabel: string;
    /**
     * Three paragraphs. Each paragraph is a list of segments;
     * a `kind: 'strong'` segment renders inside <strong>, `kind: 'accent'`
     * inside a span with the accent class, plain segments are text nodes.
     */
    paragraphs: ReadonlyArray<ReadonlyArray<IntroSegment>>;
  };
  stats: readonly StatItem[];
  services: { sectionIndex: string; items: readonly ServiceItem[] };
  selectedWork: {
    sectionIndex: string;
    /** Slug list — the actual content comes from work-projects.ts (filtered to `featured`). */
    /** No data here on purpose; the section composes from work-projects.ts. */
    indexCopy: string;
    indexLink: { href: string; label: string };
  };
  selectedClients: {
    sectionIndex: string;
    intro: ReadonlyArray<IntroSegment>;
    items: readonly ClientItem[];
    foot: string;
  };
  recognition: {
    sectionIndex: string;
    lede: ReadonlyArray<IntroSegment>;
    items: readonly RecognitionItem[];
  };
  experience: {
    sectionIndex: string;
    items: readonly XpItem[];
  };
  endCta: {
    headingLines: ReadonlyArray<{ text: string; variant?: 'outline' }>;
    sub: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export type IntroSegment =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'accent'; value: string };

export type Variant = 'A' | 'B';
```

Notes:

- `WorkProject` lives in `_types/work.ts` (not inline in `home.ts`) because Phase 6 reuses it.
- `IntroSegment` is a discriminated union so a single render helper handles all rich-text paragraphs (intro, clients-intro, recognition lede). Avoids HTML strings + `dangerouslySetInnerHTML`.
- All readonly modifiers are aggressive; the const-asserted data objects in `_lib/*` naturally infer to readonly tuples, and `satisfies` enforces shape without erasing literal types.

## 3. Content files

### 3.1 `app/_lib/work-projects.ts`

```ts
import type { WorkProject } from '../_types/work';

export const workProjects = [
  {
    slug: 'avsb',
    num: '01',
    title: 'AvsB',
    summary: 'An in-house, CLI-driven A/B testing platform — built from scratch.',
    tags: ['Next.js', 'TypeScript', 'ClickHouse', 'Product'],
    featured: true,
    order: 1,
    year: '2025 – Present',
    type: 'own',
  },
  {
    slug: 'kemon-doctor',
    num: '02',
    title: 'Kemon Doctor',
    summary: 'A non-profit platform helping patients in Bangladesh find trustworthy doctors.',
    tags: ['Next.js 15', 'PostgreSQL', 'Drizzle', 'Solo'],
    featured: true,
    order: 2,
    year: '2024 – Present',
    type: 'own',
  },
  {
    slug: 'client',
    num: '03',
    title: 'Client Work',
    summary: '4+ years of A/B tests and conversion experiments for ecommerce and SaaS clients.',
    tags: ['JavaScript', 'SCSS', 'Optimizely', 'Kameleoon'],
    featured: true,
    order: 3,
    type: 'client',
  },
] as const satisfies readonly WorkProject[];

/** Featured-only filter used by the home page. */
export const featuredWorkProjects = workProjects.filter((p) => p.featured);
```

Three projects ship in Phase 4 (the legacy home page only shows three). The masterplan lists six total — the additional three land in Phase 6 alongside `/work`. Phase 4 logs the gap to `futureWorks.md` if it ships before Phase 6.

### 3.2 `app/_lib/home-content.ts`

Single `homeContent: HomeContent` object exported `as const satisfies HomeContent`. Drawn line-for-line from `index.html`:

- **hero.topbarLeft** = `{ name: 'Mainul Islam', role: 'Frontend Developer' }`
- **hero.topbarRight** = `{ version: 'Portfolio v3', year: '2026', metric: '7 yrs · 6 countries' }`
- **hero.sub** = exact paragraph from `index.html:960–962`
- **hero.statusLine** = `'Available for new A/B testing & frontend projects'`
- **hero.ctaLabel** = `'Get in touch'`, **hero.ctaHref** = `'/contact'`
- **marquee.tokens** = the 8 tokens, 2 accented (`Conversion Optimization`, `Experimentation`)
- **intro.label** = `'— Introduction'`, **intro.indexLabel** = `'01 / Index'`
- **intro.paragraphs** = three paragraphs as `IntroSegment[]` arrays
- **stats** = `[ { value: 500, suffix: '+', label: 'A/B tests & experiments shipped' }, { value: 7, label: 'Years building for the web' }, { value: 6, label: 'Countries worked with' } ]`
- **services.sectionIndex** = `'02 / Disciplines'`, **services.items** = three `ServiceItem`s
- **selectedWork.sectionIndex** = `'03 / Selected Work'`, **selectedWork.indexCopy** unused (see note below), **selectedWork.indexLink** = `{ href: '/work', label: 'View full work index' }`
- **selectedClients.sectionIndex** = `'04 / Clients'`, **items** = the 8 brands, **foot** = `'— and many more, listed only where approved.'`
- **recognition.sectionIndex** = `'05 / Recognition'`, **lede** = the SOTD lede paragraph, **items** = the two SOTD entries (Dec 2021 BestCSS.in, Nov 2021 Design Nominees)
- **experience.sectionIndex** = `'06 / Experience'`, **items** = the two xp entries
- **endCta.headingLines** = `[ { text: "Let's" }, { text: 'build something', variant: 'outline' }, { text: 'measurable.' } ]`
- **endCta.sub** = legacy paragraph, **endCta.ctaLabel** = `'Start a conversation'`, **endCta.ctaHref** = `'/contact'`

Type `HomeContent['selectedWork']` drops `indexCopy` if it ends up unused (currently the section has no intro paragraph in the legacy file). Keep the field optional.

### 3.3 `app/_lib/accent-swatches.ts`

```ts
export type AccentSwatch = {
  /** Hex string used as the value of --accent. */
  hex: string;
  /** Visible name used as aria-label on the swatch button. */
  label: string;
};

export const accentSwatches = [
  { hex: '#1f3a5f', label: 'Ink navy' },
  { hex: '#2e5a3e', label: 'Forest' },
  { hex: '#7a2e2e', label: 'Burgundy' },
  { hex: '#b88a30', label: 'Mustard' },
  { hex: '#0a0908', label: 'Mono (no accent)' },
] as const satisfies readonly AccentSwatch[];

export const defaultAccent: AccentSwatch = accentSwatches[0]; // Ink navy

/** Localstorage key, preserved from the legacy static site (mn-accent-v2). */
export const ACCENT_STORAGE_KEY = 'mn-accent-v2';

/**
 * Validate a hex value against the known swatch list.
 * Returns the matching swatch or null. Used on mount so a stale or hand-edited
 * localStorage value can't poison the page.
 */
export function findSwatch(hex: string | null | undefined): AccentSwatch | null {
  if (!hex) return null;
  return accentSwatches.find((s) => s.hex === hex) ?? null;
}
```

### 3.4 `app/_lib/use-count-up.ts`

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Final value to count up to. */
  target: number;
  /** Trigger the count-up when this becomes true. Toggling back to false does nothing. */
  start: boolean;
  /** Duration in ms. Default 1400. */
  duration?: number;
};

/**
 * Latching count-up. Returns the current display value (integer).
 * Once `start` flips true, it runs once and never re-runs.
 * Honours `prefers-reduced-motion: reduce` — returns the final value immediately.
 */
export function useCountUp({ target, start, duration = 1400 }: Options): number {
  const [value, setValue] = useState<number>(0);
  const latched = useRef<boolean>(false);

  useEffect(() => {
    if (!start || latched.current) return;
    latched.current = true;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - t0;
      const t = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}
```

Trigger model: `Stat.tsx` mounts an `IntersectionObserver` keyed to its own ref (a separate, tiny observer — not the shared `RevealRoot` one, because count-up needs the event hook and Reveal only adds a class). On first intersection, the IO disconnects and `start` flips true. Pattern is short, matches the legacy behaviour.

## 4. State sharing — `HomeStateContext`

### 4.1 The boundary

`app/page.tsx` stays a server component. The first thing it renders is `<HomeShell>`, a client component that:

- Owns the React state for `variant: 'A' | 'B'` and `accent: AccentSwatch`.
- Provides the context.
- On mount, reads `localStorage[ACCENT_STORAGE_KEY]`, validates with `findSwatch`, sets `--accent` on `document.documentElement` if a valid match is found.
- Renders `{children}` — `app/page.tsx` passes every home section as a child.

Why: Hero, HeroBadge, and TweaksPanel need `'use client'` anyway. The rest of the page is server-rendered. Wrapping the page in a single client shell keeps all the static section components server-rendered and bundles the variant + accent state to one boundary.

### 4.2 `app/_components/home/HomeShell/HomeStateContext.ts`

```ts
'use client';

import { createContext, useContext } from 'react';
import type { Variant } from '../../../_types/home';
import type { AccentSwatch } from '../../../_lib/accent-swatches';

export type HomeState = {
  variant: Variant;
  setVariant: (v: Variant) => void;
  accent: AccentSwatch;
  setAccent: (a: AccentSwatch) => void;
};

export const HomeStateContext = createContext<HomeState | null>(null);

export function useHomeState(): HomeState {
  const ctx = useContext(HomeStateContext);
  if (!ctx) {
    throw new Error('useHomeState must be used inside <HomeShell>');
  }
  return ctx;
}
```

### 4.3 `app/_components/home/HomeShell/HomeShell.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { HomeStateContext } from './HomeStateContext';
import type { Variant } from '../../../_types/home';
import {
  type AccentSwatch,
  ACCENT_STORAGE_KEY,
  defaultAccent,
  findSwatch,
} from '../../../_lib/accent-swatches';

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>('A');
  const [accent, setAccentState] = useState<AccentSwatch>(defaultAccent);

  // Restore persisted accent on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      const match = findSwatch(saved);
      if (match) {
        setAccentState(match);
        document.documentElement.style.setProperty('--accent', match.hex);
      }
    } catch {
      // localStorage unavailable (private mode, quota, etc.) — leave default.
    }
  }, []);

  const setAccent = (a: AccentSwatch) => {
    setAccentState(a);
    document.documentElement.style.setProperty('--accent', a.hex);
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, a.hex);
    } catch {
      // Persist failure is non-fatal.
    }
  };

  return (
    <HomeStateContext.Provider value={{ variant, setVariant, accent, setAccent }}>
      {children}
    </HomeStateContext.Provider>
  );
}
```

Notes:

- `defaultAccent` is `Ink navy` — same as the token default in `_variables.scss`. If localStorage is empty (first visit), no inline override is needed.
- `setAccent` writes the inline property on `<html>`. The token's CSS variable is `--accent`, declared on `:root` in `_variables.scss`. Inline style on `<html>` wins over `:root` because both target the same element with equal specificity but the inline style is later in the cascade.
- The handler does NOT clear localStorage when accent equals default. Once persisted, it stays — matches legacy.

## 5. Page composition — `app/page.tsx`

```tsx
import { Container } from './_components/Container/Container';
import { Section } from './_components/Section/Section';
import { Reveal } from './_components/Reveal/Reveal';
import { SectionHead } from './_components/SectionHead/SectionHead';
import { TextLink } from './_components/TextLink/TextLink';
import { HomeShell } from './_components/home/HomeShell/HomeShell';
import { Hero } from './_components/home/Hero/Hero';
import { Marquee } from './_components/home/Marquee/Marquee';
import { Intro } from './_components/home/Intro/Intro';
import { Stats } from './_components/home/Stats/Stats';
import { Services } from './_components/home/Services/Services';
import { SelectedWork } from './_components/home/SelectedWork/SelectedWork';
import { SelectedClients } from './_components/home/SelectedClients/SelectedClients';
import { Recognition } from './_components/home/Recognition/Recognition';
import { Experience } from './_components/home/Experience/Experience';
import { EndCTA } from './_components/home/EndCTA/EndCTA';
import { TweaksPanel } from './_components/home/TweaksPanel/TweaksPanel';
import { homeContent } from './_lib/home-content';
import styles from './_components/home/_homePage.module.scss';

export default function Home() {
  return (
    <HomeShell>
      <Hero content={homeContent.hero} />
      <Marquee tokens={homeContent.marquee.tokens} />
      <Section>
        <Container>
          <Intro content={homeContent.intro} />
        </Container>
      </Section>
      <Section className={styles.statsSection}>
        <Container>
          <Reveal>
            <Stats items={homeContent.stats} />
          </Reveal>
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.services.sectionIndex}
              titleNodes={
                <>
                  What I do<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Services items={homeContent.services.items} />
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.selectedWork.sectionIndex}
              titleNodes={
                <>
                  Selected work<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <SelectedWork />
          <Reveal className={styles.selectedWorkFoot}>
            <TextLink href={homeContent.selectedWork.indexLink.href} upRight>
              {homeContent.selectedWork.indexLink.label}
            </TextLink>
          </Reveal>
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.selectedClients.sectionIndex}
              titleNodes={
                <>
                  Selected clients<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <SelectedClients content={homeContent.selectedClients} />
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.recognition.sectionIndex}
              titleNodes={
                <>
                  Recognition<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Recognition content={homeContent.recognition} />
        </Container>
      </Section>
      <Section>
        <Container>
          <Reveal>
            <SectionHead
              index={homeContent.experience.sectionIndex}
              titleNodes={
                <>
                  Experience<span className="accent">.</span>
                </>
              }
            />
          </Reveal>
          <Experience items={homeContent.experience.items} />
        </Container>
      </Section>
      <EndCTA content={homeContent.endCta} />
      <TweaksPanel />
    </HomeShell>
  );
}
```

Notes:

- `app/page.tsx` is itself a server component. Only `HomeShell`, `Hero`, `HeroBadge`, `Stats`/`Stat`, and `TweaksPanel` carry `'use client'`. Everything else is server-rendered.
- `SelectedWork` is a server component that imports `featuredWorkProjects` directly. No props needed.
- `Hero`, `Marquee`, and `EndCTA` render their own `<Section>` or section-shaped wrapper. The hero's outer element is `<header>` (matches legacy), the marquee bleeds full-width so it doesn't sit inside a `<Section>`, and `EndCTA` controls its own padding via `_EndCTA.module.scss`.
- `_homePage.module.scss` contains only:
  - `.statsSection` — strips top padding on the stats section (matches legacy `padding-top: 0;` on line 1033).
  - `.selectedWorkFoot` — `margin-top: 48px;` for the "View full work index" link.

## 6. Component specs

### 6.1 `Hero/Hero.tsx` — client

Composes the entire hero block. Reads `variant` and `setVariant` from `useHomeState()`. Owns the variant toggle buttons. Wraps the active variant in `<HeroVariantA>` or `<HeroVariantB>` keyed on `variant` so React remounts on switch — this re-fires the rise-in animation (replaces legacy reflow trick).

Props:

```ts
type Props = {
  content: HomeContent['hero'];
};
```

Markup outline:

```tsx
<header className={styles.hero} data-screen-label="Home Hero">
  <Container>
    {/* topbar */}
    <div className={styles.topbar}>
      <span>
        <strong>{content.topbarLeft.name}</strong> · {content.topbarLeft.role}
      </span>
      <TickRule className={styles.tickRule} />
      <div className={styles.topbarRight}>
        {content.topbarRight.version} · {content.topbarRight.year}
        <br />
        <strong>{content.topbarRight.metric}</strong>
      </div>
    </div>

    {/* headline rows + variant toggle */}
    <div className={styles.row}>
      <div key={variant} className={styles.variantPanel}>
        {variant === 'A' ? <HeroVariantA /> : <HeroVariantB />}
      </div>
      <div className={styles.variantToggle} role="tablist" aria-label="Headline variant">
        <button
          type="button"
          role="tab"
          aria-selected={variant === 'A'}
          className={variant === 'A' ? styles.isActive : ''}
          onClick={() => setVariant('A')}
        >
          <span className={styles.dot} aria-hidden="true" />
          Variant A
        </button>
        <button …Variant B identical… />
      </div>
    </div>

    {/* bottom strip */}
    <div className={styles.bottom}>
      <p className={styles.sub}>{content.sub}</p>
      <div className={styles.status}>
        <div className={styles.statusLine}>
          <span className={styles.live} aria-hidden="true" />
          {content.statusLine}
        </div>
        <Button href={content.ctaHref} arrow>
          {content.ctaLabel}
        </Button>
      </div>
    </div>
  </Container>
</header>
```

Reduced-motion: the rise-in animations on `.display-xl > span` are wrapped in `@include reduced-motion-safe { animation: rise … }`. The badge fade and variant fade-in same. Reveal-on-scroll for the hero is **not** wired — the hero is the first thing visible so it should animate without waiting for IntersectionObserver.

Accessibility:

- `role="tablist"` + `aria-selected` on the buttons. `aria-controls` is omitted because the variant panel does not have a stable id — instead the live region is the panel itself, which is acceptable here because the change is visually obvious. If review pushes back, add `aria-controls` and an id on `.variantPanel`.
- Headline `<h1>` lives on the visible variant's first line. Both variants render the same heading structure so swapping doesn't change the heading outline.

Risk: the live pulse dot on `.statusLine .live` uses `nav-pulse` keyframes already defined in `globals.scss` — reusing it for free.

### 6.2 `Hero/HeroVariantA.tsx` and `HeroVariantB.tsx` — server

Each is a tiny server component that returns the three headline lines. `HeroVariantA` includes the `<HeroBadge>` inside `.hero__line--shift`; `HeroVariantB` doesn't.

```tsx
// HeroVariantA.tsx — server
import { HeroBadge } from './HeroBadge';
import styles from './_Hero.module.scss';

export function HeroVariantA() {
  return (
    <>
      <div className={styles.line}>
        <h1 className="display display-xl">
          <span className={styles.d1}>Frontend</span>
        </h1>
      </div>
      <div className={`${styles.line} ${styles.lineShift}`}>
        <span className="display display-xl">
          <span className={styles.d2}>Developer</span>
        </span>
        <HeroBadge />
      </div>
      <div className={styles.line}>
        <span className="display display-xl outline">
          <span className={styles.d3}>&amp; Experiments</span>
        </span>
      </div>
    </>
  );
}
```

Variant B same structure, three different lines, no badge, no outline class on line 3 but `.accent` colour on line 3 (matches legacy line 942). Both variants share the rise-in `d-1`/`d-2`/`d-3` stagger via the SCSS module.

### 6.3 `Hero/HeroBadge.tsx` — client

```tsx
'use client';

import { useHomeState } from '../HomeShell/HomeStateContext';
import styles from './_Hero.module.scss';

export function HeroBadge() {
  const { variant, setVariant } = useHomeState();
  return (
    <button
      type="button"
      className={styles.badge}
      aria-label="Toggle headline variant"
      onClick={() => setVariant(variant === 'A' ? 'B' : 'A')}
    >
      <span className={styles.badgeSmall}>A/B</span>
      <span>Testing</span>
    </button>
  );
}
```

Rotated `-2deg` by default, returns to `0deg` on hover (transition, gated by `reduced-motion-safe`). Accent background, accent-ink text.

### 6.4 `Hero/_Hero.module.scss`

Ports lines 19–286 of `index.html`. Key class map:

| Module class      | Legacy class                      |
| ----------------- | --------------------------------- |
| `.hero`           | `.hero`                           |
| `.topbar`         | `.hero__topbar`                   |
| `.topbarRight`    | `.hero__topbar__right`            |
| `.tickRule`       | `.hero__topbar .tick-rule`        |
| `.row`            | `.hero__row`                      |
| `.line`           | `.hero__line`                     |
| `.lineShift`      | `.hero__line--shift`              |
| `.variantPanel`   | `[data-variant]` wrapper          |
| `.variantToggle`  | `.hero__variant`                  |
| `.isActive`       | `.hero__variant button.is-active` |
| `.dot`            | `.hero__variant .dot`             |
| `.badge`          | `.hero__badge`                    |
| `.badgeSmall`     | `.hero__badge .small`             |
| `.bottom`         | `.hero__bottom`                   |
| `.sub`            | `.hero__sub`                      |
| `.status`         | `.hero__status`                   |
| `.statusLine`     | `.hero__status__line`             |
| `.live`           | `.hero__status__line .live`       |
| `.d1`/`.d2`/`.d3` | `.d-1`/`.d-2`/`.d-3`              |

The display rise-in animations stay; the `.hero h1.display-xl span` overflow-hidden + translateY trick lives inside `_Hero.module.scss` so it doesn't bleed onto other pages that use `.display-xl`. All media queries from lines 218–286 are ported verbatim.

`.outline` and `.accent` classes used inline are globals (defined in `_typography.scss` and `_utils.scss`) — module classes deliberately don't replace them.

### 6.5 `Marquee/Marquee.tsx` — server

```tsx
type Props = {
  tokens: HomeContent['marquee']['tokens'];
};

export function Marquee({ tokens }: Props) {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        <MarqueeTokens tokens={tokens} />
        <MarqueeTokens tokens={tokens} />
      </div>
    </div>
  );
}

function MarqueeTokens({ tokens }: Props) {
  return (
    <span>
      {tokens.map((tok, i) => (
        <span key={i} className={tok.accent ? 'accent' : undefined}>
          {tok.label}
          <span className={styles.dot} aria-hidden="true" />
        </span>
      ))}
    </span>
  );
}
```

`aria-hidden="true"` because the marquee is purely decorative. Animation uses the global `@keyframes marquee` already in `globals.scss`. Gated with `@include reduced-motion-safe { animation: marquee 38s linear infinite; }` inside `_Marquee.module.scss`.

### 6.6 `Intro/Intro.tsx` — server

Two-column grid (sticky mono label left, body right). Renders the three paragraphs by mapping `IntroSegment[]` to JSX:

```tsx
function renderSegments(segments: ReadonlyArray<IntroSegment>) {
  return segments.map((seg, i) => {
    if (seg.kind === 'strong') return <strong key={i}>{seg.value}</strong>;
    if (seg.kind === 'accent')
      return (
        <span key={i} className="accent">
          {seg.value}
        </span>
      );
    return <span key={i}>{seg.value}</span>;
  });
}
```

Uses two `<Reveal>` wrappers: the label has no `data-delay`, the body has `data-delay={1}` (matches legacy `data-delay="1"` on line 1020). The mono label is sticky (`position: sticky; top: 100px;`) and unwraps at ≤768px (legacy line 376).

### 6.7 `Stats/Stats.tsx` — client

```tsx
'use client';

import { Stat } from './Stat';
import type { StatItem } from '../../../_types/home';

type Props = { items: readonly StatItem[] };

export function Stats({ items }: Props) {
  return (
    <div className={styles.stats}>
      {items.map((it, i) => (
        <Stat key={i} item={it} />
      ))}
    </div>
  );
}
```

### 6.8 `Stats/Stat.tsx` — client

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useCountUp } from '../../../_lib/use-count-up';
import type { StatItem } from '../../../_types/home';

export function Stat({ item }: { item: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const value = useCountUp({ target: item.value, start: inView });

  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.value}>
        {value}
        {item.suffix && <span className={styles.small}>{item.suffix}</span>}
      </div>
      <div className={styles.label}>{item.label}</div>
    </div>
  );
}
```

Note: `Stat` mounts its own IO instead of leaning on `RevealRoot` because it needs the intersection _event_, not just a class. Two observers on the page is fine. `threshold: 0.4` matches legacy behaviour (counter fires when ~half the stat is visible).

### 6.9 `Services/Services.tsx` + `ServiceCard.tsx` — server

`Services` renders the three-column grid. Each card is wrapped in `<Reveal delay={i+1}>` so they stagger in. `ServiceCard` renders the static markup using `Tag` for the tag pills.

```tsx
function ServiceCard({ item }: { item: { item: ServiceItem }['item'] }) {
  return (
    <div className={styles.service}>
      <span className={styles.num}>[{item.num}]</span>
      <h3 className={styles.title}>
        {item.titleLines[0]}
        <br />
        {item.titleLines[1]}
      </h3>
      <p className={styles.desc}>{item.desc}</p>
      <div className={styles.tags}>
        {item.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </div>
  );
}
```

Note: the legacy file renders tag pills inline. The shared `<Tag>` component (Phase 3) uses the same visual style — mono uppercase, rounded pill, hairline border. Reuse it.

### 6.10 `SelectedWork/SelectedWork.tsx` + `WorkRow.tsx` — server

`SelectedWork` imports `featuredWorkProjects` directly and maps over them. Each row is a `<WorkRow>`. Wrap each in `<Reveal>` for stagger.

```tsx
import { featuredWorkProjects } from '../../../_lib/work-projects';
import { Reveal } from '../../Reveal/Reveal';
import { WorkRow } from './WorkRow';

export function SelectedWork() {
  return (
    <div className={styles.list}>
      {featuredWorkProjects.map((p, i) => (
        <Reveal key={p.slug} delay={((i + 1) % 5) as 1 | 2 | 3 | 4 | 5}>
          <WorkRow project={p} />
        </Reveal>
      ))}
    </div>
  );
}
```

`WorkRow` renders the `<a href={'/work/' + project.slug}>` link with the title, summary, tags, and arrow circle. Hover state — title slides 14px right, arrow rotates -45deg, accent sweep — all in `_SelectedWork.module.scss` and gated with `reduced-motion-safe`.

**Phase 6 note:** the case study routes (`/work/avsb`, `/work/kemon-doctor`, `/work/client`) do not exist yet. Clicking a row results in a 404 until Phase 6 lands. Add a one-liner to `futureWorks.md` if Phase 6 hasn't landed when this PR ships.

### 6.11 `SelectedClients/SelectedClients.tsx` + `ClientCard.tsx` — server

Two-column grid → four-column grid responsively. Intro paragraph (with strong/accent segments), then the grid, then a foot caption. `ClientCard` is a flat sub-component file.

### 6.12 `Recognition/Recognition.tsx` + `AwardCard.tsx` — server

Lede paragraph then the two SOTD award cards in a 2-column grid (1-column ≤700px). Each `AwardCard` is an external `<a>` with `target="_blank" rel="noopener noreferrer"` — done via `next/link` is wrong here, plain anchor is correct. Seal uses `font-display`, the dashed ring uses the global `@keyframes spin`. CTA strip uses inline `Arrow` glyph (the `↗` character, matching legacy).

### 6.13 `Experience/Experience.tsx` + `XpRow.tsx` — server

Two `xp-row` entries. Year, role (with optional `at:` company in accent colour), description, location. Stacked at ≤900px.

### 6.14 `EndCTA/EndCTA.tsx` — server

Self-contained section (its own `<section>` element, not a `<Section>` wrapper, because the padding values differ — `padding: clamp(60px, 8vw, 140px) 0 clamp(40px, 6vw, 100px)` from legacy line 727). Renders the headline lines with optional `outline` variant on the middle line, then sub + accent button.

```tsx
export function EndCTA({ content }: { content: HomeContent['endCta'] }) {
  return (
    <section className={styles.endcta} data-screen-label="End CTA">
      <Container>
        <div className={styles.inner}>
          <Reveal as="header">
            <h2 className={styles.heading}>
              {content.headingLines.map((line, i) => (
                <span key={i} className={line.variant === 'outline' ? 'outline' : undefined}>
                  {line.text}
                  {i < content.headingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal className={styles.sub} delay={1}>
            <p>{content.sub}</p>
            <Button href={content.ctaHref} variant="accent" arrow>
              {content.ctaLabel}
            </Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
```

### 6.15 `TweaksPanel/TweaksPanel.tsx` — client

```tsx
'use client';

import { useHomeState } from '../HomeShell/HomeStateContext';
import { accentSwatches } from '../../../_lib/accent-swatches';
import styles from './_TweaksPanel.module.scss';

export function TweaksPanel() {
  const { accent, setAccent, variant, setVariant } = useHomeState();
  return (
    <aside className={styles.tweaks} aria-label="Tweaks">
      <div className={styles.row}>
        <span className={styles.label}>Accent</span>
        <div className={styles.swatches} role="group" aria-label="Accent colour">
          {accentSwatches.map((s) => (
            <button
              key={s.hex}
              type="button"
              className={s.hex === accent.hex ? styles.isActive : ''}
              style={{ background: s.hex }}
              aria-label={s.label}
              aria-pressed={s.hex === accent.hex}
              onClick={() => setAccent(s)}
            />
          ))}
        </div>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Hero</span>
        <div className={styles.toggle} role="group" aria-label="Hero variant">
          {(['A', 'B'] as const).map((v) => (
            <button
              key={v}
              type="button"
              className={v === variant ? styles.isActive : ''}
              aria-pressed={v === variant}
              onClick={() => setVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

`style={{ background: s.hex }}` is the **one allowed inline style** in this phase. CLAUDE.md forbids inline `style={{}}` for layout/typography; using it here purely to set a dynamic colour from a data swatch is functionally equivalent to a CSS variable on the element. Justification comment goes inline in the file (`// inline background is the only way to render the swatch's data colour — no other styling here is inline`).

Alternative considered: CSS variable per swatch (`style={{ '--sw': s.hex }}` with a module class consuming it). Same inline-style restriction applies and adds a layer of indirection without buying anything. Keep `background: s.hex`.

`_TweaksPanel.module.scss` ports lines 762ish from `shared.css` (the masterplan references it). Confirm against `shared.css` once Phase 4 implementation starts. Fixed `position: fixed; right: 24px; bottom: 24px;`. Collapses to a compact chip at ≤640px (matches plan).

Accessibility:

- `<aside aria-label="Tweaks">` makes the landmark navigable.
- `aria-pressed` on each button (because they are toggle buttons, not nav).
- `aria-label` on swatch buttons describes the colour by name (not hex).
- 44×44 minimum touch target ≤640px (`.swatches button { width: 28px; height: 28px; padding: 8px; }` → 44×44 effective).

## 7. Reduced-motion handling

Every animation/transition declared in this phase MUST be wrapped in `@include reduced-motion-safe { … }`:

- Hero rise-in spans (d1, d2, d3).
- Hero badge fade-in + hover rotate.
- Hero variant toggle fade-in.
- Hero `.live` pulse — already global, already gated.
- Marquee infinite scroll.
- Award seal infinite spin.
- Service card hover background lighten.
- Work-row hover title translate + arrow rotate + accent sweep.
- Client card hover background lighten.
- Button + TextLink hover transitions (already gated in Phase 3).
- Stats count-up — gated in the hook (returns final value immediately).

Reveal-on-scroll transforms — already gated globally by the safety net in `globals.scss:222–236`. Nothing extra needed for `<Reveal>` wrappers.

## 8. localStorage

- **Key:** `mn-accent-v2` (constant `ACCENT_STORAGE_KEY`). Reusing the legacy key on purpose (plan §"Decisions" item on `mn-accent-v2`).
- **Value:** the hex string of one of the five `accentSwatches`. Anything else is rejected by `findSwatch` and ignored.
- **Read:** in `HomeShell` mount effect. Try/catch around localStorage access (private browsing, storage quota, SSR-safe).
- **Write:** in `setAccent`. Try/catch around the write. Failure is non-fatal — the in-memory state still updates and the swap still visually happens.
- **No quota guard needed:** payload is at most 7 chars. Storage cannot hit quota from this site.

## 9. Page-level styles — `_homePage.module.scss`

```scss
.statsSection {
  padding-top: 0; // matches legacy index.html:1033
}

.selectedWorkFoot {
  margin-top: 48px;
}
```

Nothing else. The home page is composition; no other page-level chrome is needed.

## 10. Edge cases

| Case                                                                              | Behaviour                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| User has saved an accent that's not in `accentSwatches` (manually edited storage) | `findSwatch` returns `null`. Accent stays at the token default. localStorage entry is **not** cleared (we don't want to surprise the user — if a future version adds the colour back, it works).                                                                                                                                                             |
| User toggles variant while rise-in animation is still running                     | `key={variant}` on `.variantPanel` remounts the inner component. Old animations are aborted by unmount; new ones start clean. Both buttons remain operable throughout.                                                                                                                                                                                       |
| User clicks the badge during animation                                            | Same as above — badge calls `setVariant`, which triggers the same remount.                                                                                                                                                                                                                                                                                   |
| `IntersectionObserver` is unavailable (very old browser)                          | `Stat` falls back to `setInView(true)` immediately on mount → count-up runs immediately. RevealRoot already handles this case in Phase 3.                                                                                                                                                                                                                    |
| `prefers-reduced-motion: reduce`                                                  | Hero spans, badge, variant fade, marquee, count-up, award seal spin, hover transitions all skip. Final visual state is identical (just no in-motion).                                                                                                                                                                                                        |
| Page rendered server-side (no `window`)                                           | `HomeShell` is a client component, but Next.js still renders the children server-side on the first pass. The hero topbar, marquee, intro, services, work, clients, recognition, experience, end-cta all render with full content. Stats render as `0` initially (acceptable — flashes to count-up animation on client mount).                                |
| User refreshes after picking a non-default accent                                 | On mount, `useEffect` reads localStorage, applies the hex inline on `<html>`, sets state. There IS a brief flash of the default colour before the effect fires — acceptable for a portfolio. A `<script>` in `<head>` to apply the colour pre-hydration is a future-works item.                                                                              |
| User navigates to `/about`, then back to `/`                                      | `HomeShell` unmounts and remounts. Accent state is re-read from localStorage. Variant resets to `A` (no persistence on variant by design — matches legacy).                                                                                                                                                                                                  |
| User opens dev tools and sets `localStorage[ACCENT_STORAGE_KEY] = '#ff00ff'`      | Next mount: `findSwatch('#ff00ff')` returns null. Accent stays default. No exception thrown.                                                                                                                                                                                                                                                                 |
| Variant B headline has the word "Revenue" coloured with `--accent`                | When accent is `Mono (no accent)` (`#0a0908`), "Revenue" reads as plain text. Acceptable — that's the point of the mono variant.                                                                                                                                                                                                                             |
| Touch target on swatch buttons at ≤640px                                          | `.swatches button` = 28×28 visual, 44×44 hit area via `padding`. Adjacent spacing 8px. Meets WCAG.                                                                                                                                                                                                                                                           |
| Long brand name in `ClientCard` (e.g. `IronmongeryDirect` with `<wbr/>`)          | The legacy markup contains a `<wbr>` inside the string. Rendering: store the brand as JSX-safe segments OR use the literal `<wbr/>` in JSX. Use JSX: `name: 'Ironmongery​ Direct'` (zero-width space) won't work for wbr — instead store as `nameParts: ['Ironmongery', 'Direct']` and render `{first}<wbr/>{second}`. Update `ClientItem` type accordingly. |

**Update to `ClientItem` type from §2.2** based on the last edge case:

```ts
export type ClientItem = {
  sector: string;
  /** Array of strings rendered with <wbr/> between, allowing soft-break for long names. */
  nameParts: readonly string[];
};
```

Single-word brands (`Unity`, `Deel`) just use a 1-element array. `Ironmongery Direct` uses `['Ironmongery', 'Direct']`. Adjust `ClientCard.tsx` to map and inject `<wbr/>`.

## 11. SEO / metadata

Phase 4 does NOT change `app/layout.tsx` metadata. The Phase 1 metadata (title + description) is fine for the home page. Phase 7 ships full Metadata API (OG image, Twitter card, robots, etc.).

If pushback: the home page could override metadata via `export const metadata` in `app/page.tsx`. But the layout-level title already targets the home page exactly ("Mainul Islam · Frontend Developer · A/B Testing & Experimentation"). Don't duplicate.

## 12. Accessibility checklist

- [ ] Single `<h1>` on the page: lives inside the active hero variant.
- [ ] Heading order: h1 (hero) → h2s (section titles + `endcta__heading`) → h3s (work rows, services, awards, xp roles, client names).
- [ ] `<nav>` and `<main>` from layout.tsx are unchanged; the home page sits inside `<main>`.
- [ ] Skip link from layout.tsx still works.
- [ ] All interactive elements reachable by Tab in visual order: nav links → hero variant buttons → hero badge → CTA → work rows → external award links → footer CTA → tweaks panel.
- [ ] Tweaks panel: each button has `aria-label` (swatches) or readable text (A/B). `aria-pressed` reflects active state.
- [ ] Decorative SVGs (`Arrow`, dot, tick-rule marks, live pulse, marquee dots) all have `aria-hidden="true"`.
- [ ] External award links use `target="_blank" rel="noopener noreferrer"` AND include a visual "↗" indicator.
- [ ] Marquee gets `aria-hidden="true"` because the content is repeated and decorative — screen readers shouldn't read it.
- [ ] Stats count-up has no announcement: screen readers see the final value (the `value` state initialises to 0, but on `prefers-reduced-motion: reduce` the value is the target immediately; for default users, the SR will pick up the changing value, which is fine).
- [ ] Hero `.live` pulse is decorative — `aria-hidden="true"`.
- [ ] Lighthouse a11y on `/` ≥ baseline from Phase 3.

## 13. Verification checklist

Run before merging:

1. `npm run build` clean.
2. `npx tsc --noEmit` clean.
3. `npm run lint` clean.
4. Manual:
   - `/` renders all sections in order: Hero, Marquee, Intro, Stats, Services, SelectedWork, SelectedClients, Recognition, Experience, EndCTA. TweaksPanel visible bottom-right.
   - Click "Variant A" / "Variant B" → headlines swap; rise-in animation re-fires.
   - Click hero badge → variant cycles.
   - Click each accent swatch → `--accent` updates site-wide (Nav active indicator, intro accent text, work rows on hover, etc.).
   - Hard refresh → accent persists.
   - Scroll past Stats → numbers count up once. Scroll back up and re-down → no double-fire.
   - Hover a `WorkRow` → title slides, arrow rotates, accent sweep fills.
   - Hover a `ServiceCard` → background lightens to `--paper`.
   - Click an award card → opens external feature in a new tab.
   - `prefers-reduced-motion: reduce` (DevTools → Rendering) → no marquee scroll, no rise-in, no spin, no count-up animation (numbers show finals); hover transforms suppressed.
   - 320px viewport → no horizontal overflow; display-xl floor visible; tweaks panel still reachable.
   - Keyboard: Tab through every interactive element. Visible focus on each.
   - Lighthouse a11y ≥ Phase 3 baseline.
5. `futureWorks.md`:
   - Log: `/work` index + case study routes don't exist until Phase 6 — `SelectedWork` rows will 404 until then.
   - Log: pre-hydration accent application (avoiding the first-paint flash) is deferred to a future enhancement.

## 14. Out of scope (later phases)

- `/work`, `/about`, `/contact` content (Phase 5–6).
- Case study routes — Phase 6.
- Real favicon, OG image, sitemap, robots (Phase 7 + `futureWorks.md`).
- Self-hosted CV PDF (Phase 7).
- Self-hosted portrait (Phase 5).
- Pre-hydration accent application (no flash on refresh).
- Hero variant analytics endpoint (masterplan §849).
- Dark mode.

## 15. Implementation order

Bottom-up: types → data → primitives needed → leaf components → containers → state → page.

1. `app/_types/work.ts` + `app/_types/home.ts`.
2. `app/_lib/work-projects.ts`, `app/_lib/home-content.ts`, `app/_lib/accent-swatches.ts`.
3. `app/_lib/use-count-up.ts`.
4. `HomeShell/HomeStateContext.ts` + `HomeShell.tsx`.
5. Hero (variants → badge → composer → module).
6. Marquee, Intro, EndCTA (server, simpler).
7. Stats + Stat.
8. Services + ServiceCard.
9. SelectedClients + ClientCard.
10. Recognition + AwardCard.
11. Experience + XpRow.
12. SelectedWork + WorkRow.
13. TweaksPanel.
14. `_homePage.module.scss`.
15. `app/page.tsx` rewrite.
16. End-to-end verification (§13).
17. `futureWorks.md` updates.

Each step is its own commit so the diff stays readable. Sub-agents (code-reviewer) before opening the PR.

## 16. Files NOT touched

For absolute clarity:

- `app/layout.tsx`.
- `app/_components/Nav/*`, `app/_components/Footer/*`, `app/_components/CustomCursor/*`, `app/_components/RevealRoot/*`.
- `app/_components/{Container,Section,SectionHead,Reveal,Arrow,TickRule,MonoLabel,PageIntro,Button,TextLink,Tag}/*`.
- `app/_styles/{_variables,_mixins,_typography,_utils,globals}.scss` — no changes.
- `app/_lib/site-config.ts`.
- `next.config.ts`, `tsconfig.json`, `package.json`.
- `app/work/*`, `app/about/*`, `app/contact/*` — placeholders untouched.

If any file in this list needs to change during implementation, that's a spec breach; stop and amend the spec rather than slip-streaming the change.

---

## 17. Revision 2 — GSAP, ScrollTrigger, and page loader

**Date:** 2026-05-22 (evening)
**Reason:** the original §13 verification path accepted a brief SSR→hydration flash (Stats animating from 0; persisted accent applied in `useEffect` after first paint). On review, that flash is not acceptable for a portfolio whose subject is high-craft frontend. This revision swaps the motion system to GSAP + ScrollTrigger and adds a page loader to hide the flash entirely.

This section overrides specific parts of the spec above. Where the original and this revision conflict, the revision wins.

### 17.1 Dependencies added

Gated on `/audit-deps` approval at implementation time.

| Package              | Version               | Purpose                                                                                     | Size (gzipped) |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| `gsap`               | `^3.12.5` (or latest) | Core timeline + tween engine. Free for commercial use under the standard GreenSock licence. | ~25KB          |
| `@gsap/react`        | `^2.x`                | `useGSAP()` hook — cleanup on unmount, scope to a ref, Strict-Mode-friendly.                | <1KB           |
| `gsap/ScrollTrigger` | (in `gsap`)           | Scroll-driven plugin. Registered once.                                                      | ~12KB          |

Total: ~37KB on the home route bundle. Acceptable cost for the craft signal and the unified motion system. Tracked in `futureWorks.md` only if `/audit-deps` flags anything we want to revisit later.

**Note on licence:** `gsap` and `ScrollTrigger` are free for commercial use as of mid-2024 (Webflow's acquisition of GreenSock released the previously paid plugins to the free tier). `/audit-deps` re-confirms before install.

### 17.2 File tree — additions, edits, and removals

**Additions** (in addition to original §1):

```
app/
├── _components/
│   └── Loader/                                             ← NEW (lives in layout, not home/)
│       ├── Loader.tsx                                      ← 'use client' — first-load + route-change timelines
│       └── _Loader.module.scss
├── _lib/
│   └── motion.ts                                           ← NEW — registers ScrollTrigger once; re-exports gsap
```

**Edits**:

- `app/layout.tsx` — remove `<RevealRoot />` import + mount; add `<Loader />` as the first child of `<body>` (above the skip-link).
- `app/_components/Reveal/Reveal.tsx` — REWRITE: GSAP/ScrollTrigger-backed, public API unchanged.
- `app/_styles/globals.scss` — remove `.reveal { … }`, `.reveal.is-inview { … }`, `.reveal[data-delay='n']`; remove `@keyframes rise`, `fade-in`, `marquee`, `spin`, `scroll-bar`. **Keep** `@keyframes nav-pulse` (still used directly by Nav and the hero `.live` dot — keeping it on CSS for a continuous decorative loop is simpler than a long-running GSAP timeline). **Keep** the global `@media (prefers-reduced-motion: reduce)` safety net at lines 222–236 as defence-in-depth.

**Removals**:

- `app/_components/RevealRoot/RevealRoot.tsx` — `git rm`. Fully replaced by ScrollTrigger inside the rebuilt `<Reveal>`.
- `app/_lib/use-count-up.ts` — never created. The original spec §3.4 is voided.

**Originally listed under "files NOT touched" (§16) that this revision now touches:**

- `app/layout.tsx` — see edits above.
- `app/_components/RevealRoot/` — deleted.
- `app/_components/Reveal/` — rewritten.
- `app/_styles/globals.scss` — see edits above.
- `package.json` + `package-lock.json` — three new deps.

### 17.3 Page loader (NEW)

**File:** `app/_components/Loader/Loader.tsx` (client) + `_Loader.module.scss`
**Mounted in:** `app/layout.tsx`, as the very first child of `<body>` (above the skip-link).
**Lifetime:** mounted on every route. Visible on first paint; reappears in a thin form on each `usePathname` change.

#### 17.3.1 Visual design (first load)

Inspired by Awwwards / Cuberto-style intros, but compressed to fit the 400ms-minimum policy. Tasteful, single brand moment, then out.

Centred composition against `var(--bg)`:

```
                    ┌────────────────────────────┐
                    │                            │
                    │        MAINUL.             │   ← display, accent `.`
                    │   ────────────────         │   ← hairline
                    │  PORTFOLIO V3 · 2026       │   ← mono caption
                    │                            │
                    │  ━━━━━━━━━░░░░░░░░░░░      │   ← accent progress bar
                    │                            │     (1px tall, 240px wide)
                    └────────────────────────────┘
```

Style map:

| Element             | Style                                                                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Container `.loader` | `position: fixed; inset: 0; z-index: 999; background: var(--bg); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;`                                                        |
| `.wordmark`         | `font-family: var(--font-display); font-size: clamp(6.4rem, 11vw, 14rem); font-weight: 500; text-transform: uppercase; line-height: 0.85;` — trailing `.` in `<span className={styles.dot}>` with `color: var(--accent)` |
| `.hairline`         | `width: 240px; height: 1px; background: var(--rule-strong);`                                                                                                                                                             |
| `.caption`          | `font-family: var(--font-mono); font-size: 1.15rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-muted);`                                                                                          |
| `.progressTrack`    | `width: 240px; height: 1px; background: rgba(10,9,8,0.06); margin-top: 8px; overflow: hidden;`                                                                                                                           |
| `.progressFill`     | `height: 100%; background: var(--accent); transform-origin: left center; transform: scaleX(0);` (SSR default) — GSAP drives the scaleX                                                                                   |
| `.routeBar`         | `position: fixed; top: 0; left: 0; width: 100%; height: 1px; background: var(--accent); display: none;` — used on route changes only                                                                                     |

Mobile (≤640px): wordmark uses `clamp(4.8rem, 16vw, 8rem)`, progress track width 160px, gap 16px. Otherwise identical.

#### 17.3.2 First-load sequence (GSAP timeline)

`useGSAP()` runs once after mount. Two timelines: an "enter" timeline (progress fill, paused exit) and an "exit" timeline played when both conditions hold:

1. Enter timeline started (progress fill ran ≥400ms).
2. Hydration complete (signalled by a `ready` flag flipped in a parallel `useEffect`; any effect on the loader fires after hydration, so this is essentially immediate on first mount).

```ts
'use client';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';

const enterTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
const exitTl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

enterTl.to(`.${styles.progressFill}`, { scaleX: 1, duration: 0.4, ease: 'power2.out' });
enterTl.call(() => {
  enterDone.current = true;
  if (readyRef.current) exitTl.play();
});

exitTl.to(
  [`.${styles.wordmark}`, `.${styles.caption}`, `.${styles.progressTrack}`, `.${styles.hairline}`],
  {
    opacity: 0,
    duration: 0.15,
  },
);
exitTl.to(`.${styles.loader}`, { yPercent: -100, duration: 0.45 }, '-=0.05');
exitTl.set(`.${styles.loader}`, { display: 'none', onComplete: () => unlockBodyScroll() });
```

Total visible time: `max(400ms, hydration-time) + 600ms` exit ≈ 1.0–1.5s on fast networks; longer on slow.

#### 17.3.3 Route-change sequence (lighter)

`useEffect(() => { … }, [pathname])` with a `firstRender` guard so the first render doesn't double-fire. On subsequent pathname changes:

```ts
gsap.set(`.${styles.routeBar}`, { display: 'block', scaleX: 0, transformOrigin: 'left center' });
gsap.to(`.${styles.routeBar}`, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
gsap.to(`.${styles.routeBar}`, {
  transformOrigin: 'right center',
  scaleX: 0,
  duration: 0.3,
  ease: 'power2.in',
  delay: 0.3,
});
gsap.set(`.${styles.routeBar}`, { display: 'none', delay: 0.6 });
```

A 1px accent line slides in from the left, fills the viewport width, then exits to the right. Total ~600ms. No wordmark on route changes — that would be obnoxious on every navigation.

Body scroll is NOT locked during route-change transitions (the bar is a thin strip at the top, doesn't visually block content).

#### 17.3.4 Body scroll lock (first-load only)

```ts
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => {
    document.body.style.overflow = '';
  };
}, []);
```

Released by the exit timeline's `onComplete` (we manually set `document.body.style.overflow = ''` there rather than relying on the cleanup, because the cleanup only runs on unmount).

#### 17.3.5 Reduced motion

`gsap.matchMedia()` wrapping inside the same `useGSAP`:

```ts
const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Full timelines above.
});

mm.add('(prefers-reduced-motion: reduce)', () => {
  gsap.set(`.${styles.progressFill}`, { scaleX: 1 });
  gsap.delayedCall(0.2, () => {
    gsap.set(`.${styles.loader}`, { display: 'none' });
    unlockBodyScroll();
  });
  // Route-change bar: never rendered.
});
```

#### 17.3.6 Accessibility

- Container: `<aside aria-hidden="true">`. Screen readers skip it.
- No focus trap. ~400–600ms is brief; trapping focus would be more disruptive than letting it slip past.
- The page beneath is in the DOM and tabbable. If a keyboard user tabs during the loader window, focus moves into the page — acceptable, especially since visual focus rings will be partially obscured for that brief window. (The skip-link is the first focusable element on the page, so it lands there naturally.)
- Body scroll lock prevents stray mouse-wheel scroll during the loader window.

#### 17.3.7 Component shape

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../_lib/motion';
import styles from './_Loader.module.scss';

export function Loader() {
  const containerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const firstRender = useRef(true);
  const readyRef = useRef(false);
  const enterDone = useRef(false);

  // Body scroll lock for first-load
  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);

  useGSAP(
    () => {
      /* enter + exit timelines (§17.3.2) */
    },
    { scope: containerRef },
  );

  // Flag ready as soon as the component has mounted (= hydration done)
  useEffect(() => {
    readyRef.current = true;
    // If the 400ms minimum has already elapsed, fire exit now.
    if (enterDone.current) {
      /* trigger exit */
    }
  }, []);

  // Route-change transitions (skips first render via firstRender ref)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    /* route-change timeline (§17.3.3) */
  }, [pathname]);

  return (
    <aside ref={containerRef} aria-hidden="true" className={styles.loader} data-loader>
      <div className={styles.routeBar} />
      <div className={styles.wordmark}>
        Mainul<span className={styles.dot}>.</span>
      </div>
      <div className={styles.hairline} />
      <div className={styles.caption}>Portfolio v3 · 2026</div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} />
      </div>
    </aside>
  );
}
```

No props. The loader is self-contained and configuration-free.

### 17.4 `app/_lib/motion.ts` (NEW)

Single source for GSAP plugin registration and re-exports. Every component that touches GSAP imports from this file (not directly from `gsap`).

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

Why: `registerPlugin` is idempotent but it's still cleaner to call it exactly once. Importing from `_lib/motion.ts` instead of `gsap` directly also gives us a chokepoint for future plugin additions (`useGSAP` import path stays `@gsap/react`).

### 17.5 `<Reveal>` — rebuilt with GSAP/ScrollTrigger

`app/_components/Reveal/Reveal.tsx` is rewritten. Public API stays the same (`{ delay, as, className, children }`), so every existing call site continues to work.

```tsx
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../_lib/motion';

type Props = {
  delay?: 1 | 2 | 3 | 4 | 5;
  as?: 'div' | 'section' | 'article' | 'header' | 'li' | 'span';
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay, as = 'div', className, children }: Props) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const el = ref.current;
      const staggerDelay = delay ? delay * 0.08 : 0;

      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(el, { opacity: 0, y: 28 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: 'expo.out',
              delay: staggerDelay,
            });
          },
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(el, { opacity: 1, y: 0 });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<HTMLElement>} className={className}>
      {children}
    </Tag>
  );
}
```

Key differences from Phase 3:

- No `.reveal` className on the rendered element. The element's initial state is set inline by `gsap.set`. The Phase 3 `.reveal { opacity: 0; transform: translateY(28px); }` CSS is deleted from `globals.scss`.
- `data-delay` attribute removed; stagger applies via GSAP's `delay` parameter.
- `once: true` matches Phase 3 (reveal fires once per element).
- Reduced-motion handled at the matchMedia level — no separate global CSS gate needed for `.reveal` (the global `@media (prefers-reduced-motion: reduce)` safety net at lines 222–236 of globals.scss stays as a backstop).

### 17.6 `Stat` — GSAP counter via ScrollTrigger

Replaces §6.7 and §6.8 of the original spec. The per-Stat `IntersectionObserver` and the `useCountUp` hook are both gone.

```tsx
'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '../../../_lib/motion';
import type { StatItem } from '../../../_types/home';
import styles from './_Stats.module.scss';

export function Stat({ item }: { item: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useGSAP(
    () => {
      if (!ref.current) return;
      const counter = { val: 0 };
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top 80%',
          once: true,
          onEnter: () => {
            gsap.to(counter, {
              val: item.value,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: () => setValue(Math.round(counter.val)),
            });
          },
        });
      });

      mm.add('(prefers-reduced-motion: reduce)', () => {
        setValue(item.value);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.value}>
        {value}
        {item.suffix && <span className={styles.small}>{item.suffix}</span>}
      </div>
      <div className={styles.label}>{item.label}</div>
    </div>
  );
}
```

If the `setValue` on every `onUpdate` shows hitches during profiling, fall back to writing `ref.current.querySelector('[data-counter]')!.textContent = …` directly — bypasses React for the rapidly-changing value. Default is the React-stateful version because it's cleaner; only optimise if needed.

### 17.7 Hero variant restart — GSAP timeline, no `key=` remount

Replaces the `key={variant}` mechanism in original §6.1. With `useGSAP({ dependencies: [variant] })`, the timeline is killed and rebuilt on every variant change — equivalent to a remount, without the DOM churn.

```tsx
'use client';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../../../_lib/motion';
import { useHomeState } from '../HomeShell/HomeStateContext';

export function Hero({ content }: { content: HomeContent['hero'] }) {
  const { variant, setVariant } = useHomeState();
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
        tl.from(`.${styles.d1}`, { yPercent: 110, duration: 1.05 }, 0.15);
        tl.from(`.${styles.d2}`, { yPercent: 110, duration: 1.05 }, 0.27);
        tl.from(`.${styles.d3}`, { yPercent: 110, duration: 1.05 }, 0.39);
        tl.from(`.${styles.badge}`, { opacity: 0, scale: 0.92, duration: 0.6 }, 0.7);
        tl.from(`.${styles.variantToggle}`, { opacity: 0, duration: 0.6 }, 1.0);
      });

      // Reduced-motion: no `gsap.set` needed; spans are already at their natural
      // position. Skipping the timeline = no animation.
    },
    { scope: containerRef, dependencies: [variant] },
  );

  return (
    <header ref={containerRef} className={styles.hero} data-screen-label="Home Hero">
      {/* topbar, variant panel (no key= prop), bottom — see original §6.1 */}
    </header>
  );
}
```

Absolute time positions (`0.15`, `0.27`, `0.39`, `0.7`, `1.0`) match the legacy CSS animation-delay values exactly, preserving the visual cadence.

The variant panel uses plain conditional rendering — `{variant === 'A' ? <HeroVariantA /> : <HeroVariantB />}`. No `key={variant}`. `useGSAP`'s cleanup kills the old timeline; the variant-change effect creates a new one against whichever variant just rendered.

### 17.8 Other components — GSAP migrations (summary)

For each component originally specced with CSS keyframes or hover transitions, the rule is now: declare the animation inside a `useGSAP` block, gate with `gsap.matchMedia` for reduced-motion, declare the static markup styles in the SCSS module.

| Component           | Originally                                     | Now (Rev 2)                                                                                                                                       |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Hero` rise-in      | CSS `@keyframes rise` + `animation-delay`      | GSAP timeline (§17.7).                                                                                                                            |
| `HeroBadge`         | CSS fade-in + hover rotate transition          | `useGSAP`: `gsap.from(badge, { opacity: 0, … })` for entrance; hover rotate stays CSS (`transition`-based, simpler) inside `reduced-motion-safe`. |
| `Marquee`           | CSS `@keyframes marquee` (38s linear infinite) | GSAP: `gsap.to(track, { xPercent: -50, duration: 38, repeat: -1, ease: 'none' })` inside `mm.add('no-preference')`.                               |
| `Stats` countup     | Hand-rolled `useCountUp` + per-Stat IO         | GSAP ScrollTrigger + tween on counter object (§17.6).                                                                                             |
| `AwardCard` spin    | CSS `@keyframes spin` (30s linear infinite)    | GSAP: `gsap.to(seal, { rotate: 360, duration: 30, repeat: -1, ease: 'none' })` inside `mm.add('no-preference')`.                                  |
| `WorkRow` hover     | CSS `transition: transform` + `::after` sweep  | Stays CSS (`transition`-based, gated by SCSS `@include reduced-motion-safe`). GSAP doesn't buy anything for binary hover states.                  |
| `ServiceCard` hover | CSS `transition: background`                   | Stays CSS, same gating.                                                                                                                           |
| `Hero .live` pulse  | CSS `@keyframes nav-pulse`                     | Stays CSS — kept in `globals.scss`, kept on the live dot. Continuous decorative loop; GSAP buys nothing.                                          |
| `<Reveal>`          | `.reveal` className + IO in `RevealRoot`       | Rebuilt with GSAP ScrollTrigger (§17.5).                                                                                                          |
| Loader              | (didn't exist)                                 | GSAP timeline (§17.3).                                                                                                                            |

Rule of thumb: continuous decorative CSS loops stay CSS (cheap). One-shot timelines, scroll-driven reveals, and anything that needs coordination across multiple elements use GSAP.

### 17.9 Animation system — replaces §7 of the original spec

The original §7 says "wrap every animation/transition in `@include reduced-motion-safe`". Revised:

1. **GSAP timelines:** wrap inside `gsap.matchMedia()`. The matchMedia block scopes the timeline to a media query and tears it down automatically when the media query no longer matches (e.g. the user toggles reduced motion in OS settings mid-session). Example pattern shown in §17.5–§17.7.
2. **CSS transitions and hover effects (the few that stay CSS):** continue to use `@include reduced-motion-safe { transition: …; }` in component SCSS modules. This is short and accurate.
3. **Defence in depth:** the global `@media (prefers-reduced-motion: reduce)` safety net at `globals.scss:222–236` stays. If any GSAP timeline misbehaves on a reduced-motion machine, the global rule forces `animation-duration: 0.001ms !important; transition-duration: 0.001ms !important;` and `.reveal` (if any stragglers) is forced visible. Belt and braces.

### 17.10 Implementation order — replaces §15 of the original spec

1. `/audit-deps` for `gsap` and `@gsap/react`. **Stop and ask** if anything surfaces. (License is currently free for commercial; audit re-confirms.)
2. `npm install --save gsap @gsap/react`. Commit `package.json` + `package-lock.json` as `chore: add gsap + @gsap/react`.
3. `app/_lib/motion.ts` — register ScrollTrigger, re-export `gsap` + `ScrollTrigger`.
4. `app/_components/Loader/Loader.tsx` + `_Loader.module.scss`. Verify visually in `npm run dev` on the current placeholder pages. Confirm loader appears on `/`, fades out cleanly; route-change bar appears on nav to `/work`/`/about`/`/contact` and back.
5. Edit `app/layout.tsx`: remove `<RevealRoot />`, add `<Loader />` as first child of `<body>`.
6. `git rm` `app/_components/RevealRoot/RevealRoot.tsx`.
7. Edit `app/_styles/globals.scss`: remove `.reveal { … }`, `.reveal.is-inview { … }`, `.reveal[data-delay='n']`; remove `@keyframes rise / fade-in / marquee / spin / scroll-bar`. Keep `nav-pulse`. Keep the global reduced-motion safety net.
8. Rewrite `app/_components/Reveal/Reveal.tsx` (GSAP + ScrollTrigger; public API unchanged).
9. Verify chrome still works: all four routes render with Nav + Footer + Loader; `<Reveal>` wrappers in the existing placeholders fire on scroll if present.
10. Implementation of home sections per original §15 (types → data → leaves → containers → state → page), with the Rev 2 changes:
    - `<Stat>` rewired (§17.6) — no `useCountUp` hook.
    - `<Hero>` variant timeline (§17.7) — no `key=` remount.
    - `<Marquee>` uses GSAP timeline (§17.8).
    - `<AwardCard>` spin uses GSAP timeline (§17.8).
    - Hover effects on `<WorkRow>`, `<ServiceCard>`, etc. stay CSS.
11. End-to-end verification (§13 + §17.11).
12. `futureWorks.md` updates: log the bundle-size baseline once `npm run build` reports it; note pre-hydration accent application (no flash even before the loader paints, via an inline `<script>` in `<head>`) as a future Phase 7 polish item.

Each numbered step is its own commit. PR contains: plan commit + spec commit + Rev 2 spec commit + implementation commits + futureWorks updates.

### 17.11 Verification additions — supplements §13

In addition to the original §13 checklist:

- **Loader on first paint.** Throttle DevTools network to "Slow 3G" + disable cache → loader visible across the full SSR-paint-to-hydrated window. Hero behind it never visibly flashes.
- **Loader exit.** Slide-up animation completes; body scroll re-enabled; loader element either `display: none` or fully off-screen.
- **Persisted accent.** Set an accent via TweaksPanel, hard-refresh → hero's accent dot, work-row sweep, and section-title period all render in the persisted colour from the first visible frame (the loader is masking the moment of application).
- **Route-change loader.** `/` → `/work` → `/` triggers the thin accent-bar transition each time. No wordmark replay. Bar cleans up after each transition (no z-index drift, no orphan elements).
- **Reduced motion (DevTools → Rendering → emulate `prefers-reduced-motion: reduce`):**
  - First-load loader visible for ~200ms then instantly hides — no slide, no fade.
  - Route-change bar never appears.
  - No count-up, no rise-in, no spin, no marquee.
  - Hover transforms suppressed (CSS gated by `reduced-motion-safe`).
  - Reveal targets visible immediately (no opacity-0 staggers).
- **Console.** No GSAP registration warnings, no plugin-not-registered errors on any route.
- **Bundle size sanity.** `npm run build` output: home route bundle measurably larger than `/work` / `/about` / `/contact` placeholders (which still don't import home-specific GSAP timelines but DO pull `<Reveal>` and the loader). Log final sizes in the implementation commit message or in `futureWorks.md`.
- **No `.reveal` className in the DOM.** After implementation, `document.querySelectorAll('.reveal').length === 0` on any route (the new `<Reveal>` doesn't write the className anymore).

### 17.12 Voided original sections

- **§3.4 `useCountUp`** — voided. The hook is never created.
- **§6.1 Hero `key={variant}` mechanism** — voided. See §17.7.
- **§6.5 Marquee CSS-only animation** — superseded. See §17.8.
- **§6.7–§6.8 Stats with per-Stat IO + `useCountUp`** — voided. See §17.6.
- **§7 Reduced-motion CSS-per-rule approach** — voided. See §17.9.
- **§15 Implementation order** — replaced by §17.10.

Everything else in the original spec stands as written.
