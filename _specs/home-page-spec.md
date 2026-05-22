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

No new npm dependencies. No analytics or third-party scripts. No changes to chrome (Nav, Footer, CustomCursor, RevealRoot) from Phase 3.

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
