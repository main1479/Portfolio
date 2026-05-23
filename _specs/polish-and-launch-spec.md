# Spec — Polish & launch readiness (Phase 7)

**Status:** Draft — awaiting approval
**Date:** 2026-05-23
**Branch:** `feature/polish-and-launch`
**Plan:** `_plans/polish-and-launch-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §10 Phase 7 (lines 822–843), §13 (Phase 7 open questions).

---

## 0. Recap

Phase 7 is "make it shippable." No new components, no new pages. Twelve new files: a centralised `siteUrl` (in an existing file), root + per-case OG/twitter image generators, a sitemap, a robots manifest, a 404 page, and a favicon set. Plus a CV-link swap (Google Drive → `/Resume_Mainul.pdf`), per-page `openGraph` metadata blocks on the seven public routes, an `npm audit` cleanup pass, a one-line masterplan amendment, and a Lighthouse + real-device verification loop.

The accent switcher is **dropped** — per plan §Decisions. The `--accent` CSS variable stays fixed at `#1f3a5f` (ink navy). The Variant A/B hero toggle stays.

## 1. File tree

```
app/
├── layout.tsx                                 ← EDIT — full Metadata API
├── page.tsx                                   ← EDIT — add metadata export with openGraph
├── opengraph-image.tsx                        ← NEW — root OG card
├── twitter-image.tsx                          ← NEW — re-export of opengraph-image
├── icon.svg                                   ← NEW — favicon SVG (monogram "M")
├── apple-icon.tsx                             ← NEW — generated 180×180 apple touch icon
├── sitemap.ts                                 ← NEW — static sitemap of 7 routes
├── robots.ts                                  ← NEW — allow-all robots + sitemap URL
├── not-found.tsx                              ← NEW — designed 404 page
├── _not-found.module.scss                     ← NEW — 404 page styles (CTA cluster)
├── _lib/
│   ├── site-config.ts                         ← EDIT — add siteUrl + cvHref; swap CV href
│   ├── about-content.ts                       ← EDIT — remove TODO + Drive fallback; pull cvHref from siteConfig
│   └── contact-content.ts                     ← EDIT — same
├── about/page.tsx                             ← EDIT — extend metadata with openGraph/twitter
├── contact/page.tsx                           ← EDIT — same
├── work/
│   ├── page.tsx                               ← EDIT — same
│   ├── avsb/
│   │   ├── opengraph-image.tsx                ← NEW — case-specific OG
│   │   └── twitter-image.tsx                  ← NEW — re-export
│   ├── kemon-doctor/
│   │   ├── opengraph-image.tsx                ← NEW
│   │   └── twitter-image.tsx                  ← NEW
│   └── client/
│       ├── opengraph-image.tsx                ← NEW
│       └── twitter-image.tsx                  ← NEW

docs/
└── MASTERPLAN.md                              ← EDIT — §3.1 amendment line + changelog entry

futureWorks.md                                 ← EDIT — Resolved-section entries

.env.example                                   ← NEW — documents NEXT_PUBLIC_SITE_URL

public/
└── Resume_Mainul.pdf                          ← already present (added 2026-05-23)
```

**Counts:** 12 new files, 9 modified files, 1 already-present asset (`Resume_Mainul.pdf`). No new components. No new dependencies.

**No `index.ts` re-exports.** Each consumer imports the file directly.

## 2. Site-config extension

### 2.1 `app/_lib/site-config.ts` (edit)

```ts
export type NavLink = {
  num: string;
  label: string;
  href: string;
};

export type MetaLink = {
  label: string;
  href: string;
  external?: boolean;
};

/** Absolute production URL. Set NEXT_PUBLIC_SITE_URL in Vercel; the default supports local dev. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mainul.info').replace(
  /\/$/,
  '',
);

/** Public path to the self-hosted CV. */
export const cvHref = '/Resume_Mainul.pdf';

export const siteConfig = {
  ownerName: 'Mainul Islam',
  ownerRole: 'Frontend Developer · A/B Testing & Experimentation',
  email: 'm.main2402@gmail.com',
  version: 'v3',
  year: '2026',
  siteUrl,
  cvHref,
  navLinks: [
    { num: '01', label: 'Index', href: '/' },
    { num: '02', label: 'Work', href: '/work' },
    { num: '03', label: 'About', href: '/about' },
    { num: '04', label: 'Contact', href: '/contact' },
  ] satisfies readonly NavLink[],
  metaLinks: [
    { label: 'GitHub ↗', href: 'https://github.com/main1479', external: true },
    { label: 'Resume / CV ↗', href: cvHref, external: true },
    { label: 'Email ↗', href: 'mailto:m.main2402@gmail.com' },
  ] satisfies readonly MetaLink[],
  footerCta: {
    lead: 'Say hello —',
  },
} as const;

export type SiteConfig = typeof siteConfig;
```

Notes:

- The `.replace(/\/$/, '')` trims any trailing slash from the env var so concatenation produces clean URLs (no double-slash).
- Defaulting `siteUrl` to `https://mainul.info` ensures static builds work without an env var set; Vercel previews will set `NEXT_PUBLIC_SITE_URL` to the auto-generated preview URL, so the deploy preview's metadata is correct.
- `cvHref` is exported as both a top-level const and a `siteConfig` field. Consumers can import either form; the field exists so existing `siteConfig.cvHref` references read naturally.
- `ownerRole` is a new field used by the OG image renderer. Keeps that string in one place.
- The Resume metaLink keeps `external: true` so it still opens in a new tab — PDF UX convention.

### 2.2 `app/_lib/about-content.ts` (edit)

Remove lines 4–7 (the TODO + Drive-fallback lookup):

```diff
- // TODO Phase 7: replace this with a local '/cv.pdf' once the self-hosted PDF lands.
- const cvHref =
-   siteConfig.metaLinks.find((link) => link.label.startsWith('Resume'))?.href ??
-   'https://drive.google.com/file/d/1zp7JQLgPNyEQan9bzKnLN2i-t1Du_tgI/view';
+ import { siteConfig } from './site-config';
+ const cvHref = siteConfig.cvHref;
```

(Adjust the import — `siteConfig` is already imported at line 2; the diff is conceptual. The actual edit is: drop the TODO + fallback, drop the `find().href ?? '...'` lookup, replace with `const cvHref = siteConfig.cvHref;`. Everything else in this file stays.)

### 2.3 `app/_lib/contact-content.ts` (edit)

Same shape as 2.2 — drop the same TODO + fallback + lookup, replace with `const cvHref = siteConfig.cvHref;`. Everything else in this file stays.

## 3. Root metadata + global head config

### 3.1 `app/layout.tsx` (edit) — full Metadata API

```tsx
import type { Metadata } from 'next';
import { Teko, Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import './_styles/globals.scss';
import { Nav } from './_components/Nav/Nav';
import { CustomCursor } from './_components/CustomCursor/CustomCursor';
import { Loader } from './_components/Loader/Loader';
import { siteConfig } from './_lib/site-config';

const teko = Teko({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const josefin = Josefin_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    template: `%s · ${siteConfig.ownerName}`,
  },
  description:
    'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
  applicationName: 'Mainul Islam — Portfolio',
  authors: [{ name: siteConfig.ownerName, url: siteConfig.siteUrl }],
  creator: siteConfig.ownerName,
  publisher: siteConfig.ownerName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mainul Islam',
    url: siteConfig.siteUrl,
    title: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    description:
      'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    description:
      'Frontend developer specialised in A/B testing and experimentation. Builds CLI-driven experimentation platforms and ships conversion experiments for ecommerce + SaaS clients.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${teko.variable} ${josefin.variable} ${mono.variable}`}>
      <body>
        <Loader />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CustomCursor />
        <Nav />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
```

Notes:

- **No `icons` field.** Next picks up `app/icon.svg` + `app/apple-icon.tsx` automatically — no `metadata.icons` config needed.
- **No `openGraph.images` field.** Next picks up `app/opengraph-image.tsx` and `app/twitter-image.tsx` automatically. Per-case OG image files override per-route.
- **`title` is the `template` form** so each per-page `title: 'Work'` automatically gets `'Work · Mainul Islam'` appended. The case pages' `metadata.title` already uses absolute strings from frontmatter (`'AvsB — Experimentation Platform · Mainul Islam'`) — those bypass the template via `title.absolute` if needed, but since they include the suffix already, the default template appends another `· Mainul Islam`. **Fix:** set those case `metadata.title` to absolute objects: `{ absolute: frontmatter.pageTitle }`. See §5.2.
- **`formatDetection.email/address/telephone: false`** stops iOS Safari from auto-linking phone/email/addresses (which would override our custom styling).
- **`alternates.canonical: '/'`** sets the root canonical; per-page `alternates.canonical` overrides per-route.

### 3.2 `app/page.tsx` (edit) — add a metadata export

Today `app/page.tsx` has no `metadata` export — it inherits everything from the root layout. That's fine for the title/description but means `alternates.canonical` resolves to `/` either way. We still want an explicit `openGraph.url` on the home so Next emits an absolute `og:url`. Add at the top:

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { url: '/' },
};
```

(`metadataBase` resolves the relative `'/'` to the absolute URL.)

### 3.3 `app/about/page.tsx`, `app/contact/page.tsx`, `app/work/page.tsx` (edits)

Each of these already has a `Metadata` export with `title` + `description`. Extend with `alternates.canonical`, `openGraph.url`, `twitter` block:

```tsx
export const metadata: Metadata = {
  title: 'About · Mainul Islam',
  description:
    'Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    url: '/about',
    title: 'About · Mainul Islam',
    description:
      'Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.',
  },
  twitter: {
    title: 'About · Mainul Islam',
    description:
      'Frontend developer working remotely since 2019. Specialised in A/B testing and experimentation.',
  },
};
```

For Contact: same pattern, `canonical: '/contact'`, `openGraph.type: 'website'`.
For Work: same pattern, `canonical: '/work'`, `openGraph.type: 'website'`.

Notes:

- The `title` is intentionally repeated in `openGraph.title` and `twitter.title` rather than letting it inherit, because the root `template` form (`'%s · Mainul Islam'`) only applies to `metadata.title`, not to OG titles. Without an explicit `openGraph.title`, OG inherits the root default. Stating it explicitly is cheap and removes ambiguity.

### 3.4 Per-case `page.tsx` (edits)

Each of `app/work/avsb/page.tsx`, `app/work/kemon-doctor/page.tsx`, `app/work/client/page.tsx` is a 5-line shim today (Phase 6). They each have:

```tsx
export const metadata = {
  title: frontmatter.pageTitle,
  description: frontmatter.pageDescription,
};
```

Extend to:

```tsx
import type { Metadata } from 'next';
// ...existing imports

export const metadata: Metadata = {
  title: { absolute: frontmatter.pageTitle },
  description: frontmatter.pageDescription,
  alternates: { canonical: `/work/${frontmatter.slug}` },
  openGraph: {
    type: 'article',
    url: `/work/${frontmatter.slug}`,
    title: frontmatter.pageTitle,
    description: frontmatter.pageDescription,
  },
  twitter: {
    title: frontmatter.title,
    description: frontmatter.pageDescription,
  },
};
```

Notes:

- `title: { absolute: frontmatter.pageTitle }` — the case-study `pageTitle` already ends in `· Mainul Islam`, so we use `absolute` to bypass the root template (which would otherwise double-append).
- `openGraph.type: 'article'` matches Open Graph article conventions for case studies / long-form content.

## 4. OG image generators

### 4.1 `app/opengraph-image.tsx` (new) — root OG card

```tsx
import { ImageResponse } from 'next/og';
import { siteConfig } from './_lib/site-config';

export const runtime = 'edge';
export const alt = 'Mainul Islam — Frontend Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_BG = '#f5f0ec';
const COLOR_FG = '#0a0908';
const COLOR_FG_SOFT = 'rgba(10, 9, 8, 0.78)';
const COLOR_FG_MUTED = 'rgba(10, 9, 8, 0.56)';
const COLOR_ACCENT = '#1f3a5f';
const SYSTEM_SANS = '"Helvetica Neue", Arial, sans-serif';

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: COLOR_BG,
        color: COLOR_FG,
        fontFamily: SYSTEM_SANS,
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 88px',
        position: 'relative',
      }}
    >
      {/* Top bar — mono label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 24,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLOR_FG_MUTED,
        }}
      >
        <span style={{ display: 'block', width: 56, height: 2, background: COLOR_ACCENT }} />
        Mainul Islam · v3
      </div>

      {/* Main title block */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 168, fontWeight: 600, lineHeight: 0.92 }}>Frontend</span>
          <span style={{ fontSize: 96, color: COLOR_ACCENT, marginLeft: 12 }}>·</span>
        </div>
        <span
          style={{
            fontSize: 168,
            fontWeight: 600,
            lineHeight: 0.92,
            color: 'transparent',
            WebkitTextStroke: '2.4px ' + COLOR_FG,
          }}
        >
          A/B testing.
        </span>
      </div>

      {/* Bottom strip — name + role */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid rgba(10, 9, 8, 0.32)`,
          paddingTop: 28,
          fontSize: 26,
        }}
      >
        <span style={{ color: COLOR_FG, fontWeight: 600 }}>{siteConfig.ownerName}</span>
        <span style={{ color: COLOR_FG_SOFT }}>{siteConfig.ownerRole}</span>
      </div>
    </div>,
    { ...size },
  );
}
```

Notes:

- **`runtime = 'edge'`** is required for `ImageResponse`. Per Next 16 docs.
- **System-stack typography only** — confirmed in plan. No `next/font` references inside `ImageResponse`.
- **Colour values are hardcoded literals**, not CSS variables. `ImageResponse` doesn't resolve CSS variables; we feed it the resolved RGB/hex.
- **Accent stays at `#1f3a5f`**. The accent switcher is dropped (plan §Decisions), so this is a single source of truth.
- The display treatment mirrors the home hero: a solid line + an outlined line (`-webkit-text-stroke` analog → `WebkitTextStroke`). At 1200×630 this reads cleanly in Slack and iMessage previews.
- `flex` is the layout language `ImageResponse` understands; grid is partially supported but flex is the documented happy path.

### 4.2 `app/twitter-image.tsx` (new) — re-export

```tsx
export { default, alt, size, contentType, runtime } from './opengraph-image';
```

That's the whole file. Twitter's card crawler looks for `/twitter-image` first; the re-export means one source of truth.

### 4.3 Per-case OG images

Three files, one per case route. Pattern is identical; only the imports + title content differ.

#### `app/work/avsb/opengraph-image.tsx` (new)

```tsx
import { ImageResponse } from 'next/og';
import { siteConfig } from '../../_lib/site-config';
import { frontmatter } from './content.mdx';

export const runtime = 'edge';
export const alt = `${frontmatter.title} — case study by ${siteConfig.ownerName}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_BG = '#f5f0ec';
const COLOR_FG = '#0a0908';
const COLOR_FG_SOFT = 'rgba(10, 9, 8, 0.78)';
const COLOR_FG_MUTED = 'rgba(10, 9, 8, 0.56)';
const COLOR_ACCENT = '#1f3a5f';
const SYSTEM_SANS = '"Helvetica Neue", Arial, sans-serif';

export default async function CaseOG() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: COLOR_BG,
        color: COLOR_FG,
        fontFamily: SYSTEM_SANS,
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 88px',
      }}
    >
      {/* Breadcrumb-style label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 24,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLOR_FG_MUTED,
        }}
      >
        <span style={{ display: 'block', width: 56, height: 2, background: COLOR_ACCENT }} />
        Case · {frontmatter.num} — {frontmatter.title}
      </div>

      {/* Display title (from heroLines) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 24,
          lineHeight: 0.92,
        }}
      >
        {frontmatter.heroLines.map((line, i) => {
          if (line.style === 'accent') {
            return (
              <span key={i} style={{ fontSize: 144, fontWeight: 600, color: COLOR_ACCENT }}>
                {line.text}
                {line.trailingAccentDot && '.'}
              </span>
            );
          }
          if (line.style === 'outline') {
            return (
              <span
                key={i}
                style={{
                  fontSize: 144,
                  fontWeight: 600,
                  color: 'transparent',
                  WebkitTextStroke: '2.4px ' + COLOR_FG,
                }}
              >
                {line.text}
              </span>
            );
          }
          return (
            <span key={i} style={{ fontSize: 144, fontWeight: 600, color: COLOR_FG }}>
              {line.text}
              {line.trailingAccentDot && <span style={{ color: COLOR_ACCENT }}>.</span>}
            </span>
          );
        })}
      </div>

      {/* Bottom: name + summary excerpt */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid rgba(10, 9, 8, 0.32)`,
          paddingTop: 28,
          gap: 32,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 600 }}>{siteConfig.ownerName}</span>
        <span
          style={{
            fontSize: 22,
            color: COLOR_FG_SOFT,
            maxWidth: 720,
            textAlign: 'right',
            lineHeight: 1.3,
          }}
        >
          {frontmatter.summary.length > 140
            ? frontmatter.summary.slice(0, 137).trimEnd() + '…'
            : frontmatter.summary}
        </span>
      </div>
    </div>,
    { ...size },
  );
}
```

Notes:

- **Imports `frontmatter` from the case's `content.mdx`** — the `mdx-custom.d.ts` declaration from Phase 6 already types this. The build-time import means the OG card content stays in lock-step with the case copy automatically. Update the case → update the OG card; no second authoring surface.
- **Three hero-line variants** (`plain` / `accent` / `outline`) — same treatment as the in-page case hero.
- **Summary truncated to 140 chars** for the bottom strip. The frontmatter summary is often 200+ chars; OG cards are most legible at thumbnail scale, so we crop with an ellipsis.
- **Three heroLines max** keeps the OG vertical balance; all current cases have exactly 3 lines so this is safe.
- **No `font-size` clamps** — pixel values are appropriate inside `ImageResponse` (no responsive contexts).

#### `app/work/kemon-doctor/opengraph-image.tsx` and `app/work/client/opengraph-image.tsx`

Identical to AvsB's file. Only the import line `import { frontmatter } from './content.mdx';` resolves to the local case's MDX. The rendered content varies by data, not by code. The three files are mechanical copies — three nearly-identical files is acceptable here (and DRY-ing them via a shared helper would push frontmatter loading into the helper, which couples files across routes).

### 4.4 Per-case Twitter images

Three more one-liner files, mirroring §4.2:

```tsx
// app/work/avsb/twitter-image.tsx
export { default, alt, size, contentType, runtime } from './opengraph-image';
```

Same for kemon-doctor and client.

## 5. Sitemap and robots

### 5.1 `app/sitemap.ts` (new)

```ts
import type { MetadataRoute } from 'next';
import { siteConfig } from './_lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.siteUrl;
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/work/avsb`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    {
      url: `${base}/work/kemon-doctor`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${base}/work/client`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
```

Notes:

- **7 entries, hardcoded** — plan §Decisions.
- **`lastModified: now`** — all routes share the build-time `Date`. Static enough; can be promoted to per-route timestamps later if a search engine ever cares.
- **`priority` is advisory** — Google ignores it, but Bing and others weight it. The home gets 1.0; the cases get 0.8; chrome pages get 0.7.

### 5.2 `app/robots.ts` (new)

```ts
import type { MetadataRoute } from 'next';
import { siteConfig } from './_lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
```

Notes:

- **`allow: '/'`** (with no `disallow`) is the explicit allow-all form. Bots that don't understand `allow` fall back to "no disallow means full crawl" anyway.
- **No `host` field** — that directive is non-standard and ignored by Google.

## 6. 404 page

### 6.1 `app/not-found.tsx` (new)

```tsx
import Link from 'next/link';
import { Container } from './_components/Container/Container';
import { PageIntro } from './_components/PageIntro/PageIntro';
import { Footer } from './_components/Footer/Footer';
import { Button } from './_components/Button/Button';
import styles from './_not-found.module.scss';

export const metadata = {
  title: 'Not found · Mainul Islam',
  description: "That URL doesn't lead anywhere on this site.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Container>
        <PageIntro
          label="404 / Not Found"
          titleNodes={
            <>
              Couldn&rsquo;t find
              <br />
              <span className="accent">that.</span>
            </>
          }
          sub="That URL doesn't lead anywhere on this site. Try the work index — or head back home."
        />
        <div className={styles.actions}>
          <Button href="/work">Go to work index</Button>
          <Link href="/" className={styles.homeLink}>
            Or back home →
          </Link>
        </div>
      </Container>
      <Footer />
    </>
  );
}
```

### 6.2 `app/_not-found.module.scss` (new)

```scss
@use 'variables' as *;
@use 'mixins' as *;

.actions {
  display: flex;
  align-items: center;
  gap: clamp(20px, 3vw, 40px);
  margin-top: clamp(40px, 5vw, 64px);
  padding-bottom: clamp(80px, 10vw, 140px);
  flex-wrap: wrap;
}

.homeLink {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--fg-soft);
  border-bottom: 1px solid var(--fg-soft);
  padding-bottom: 4px;

  @include reduced-motion-safe {
    transition:
      color 0.3s var(--ease-out),
      border-color 0.3s var(--ease-out);
  }
}

.homeLink:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.homeLink:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
```

Notes:

- **`robots: { index: false, follow: false }`** in the 404's metadata stops search engines from indexing missing pages (Next adds `<meta name="robots" content="noindex,nofollow">`).
- **`label="404 / Not Found"`** — uses the existing `page-intro__label` decoration (the dashbar `::before`). Reads "404 / NOT FOUND" with the standard label treatment, signalling the page type without breaking the visual rhythm.
- **Title uses the `<br/>` + accent line pattern** — same shape as Work's "Work, / in detail." and About's "A frontend dev, / measuring his work."
- Uses `<Button>` for the primary CTA and a plain `<Link>` for the secondary "back home" link. Matches the home `EndCTA`'s two-action pattern in spirit.
- `<Footer />` with default heading (no per-page heading) — keeps the page complete instead of dead-ending after the CTA.
- Touch targets: `<Button>` is ≥44×44 by Phase 3's styling; the home link is text-only and the row gives it ≥32px padding via the `actions` flex gap. The home link's `border-bottom` is the focus affordance.

## 7. Favicons

### 7.1 `app/icon.svg` (new)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#f5f0ec"/>
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="'Helvetica Neue', Arial, sans-serif"
    font-weight="700"
    font-size="38"
    fill="#0a0908"
  >M<tspan fill="#1f3a5f">.</tspan></text>
</svg>
```

Notes:

- **`viewBox="0 0 64 64"`** matches the standard favicon canvas; rendering scales cleanly to any browser size.
- **Rounded corner** (`rx="12"`) softens the mark on iOS share sheets.
- **"M." with the dot in accent** — mirrors the home page's accent-dot motif. A monogram letterform in the system stack reads cleanly at 16×16 because the stroke weight is high.
- Plain SVG inline; no SVG `<style>` block (browsers vary in their handling of CSS inside favicon SVGs).
- Next automatically emits `<link rel="icon" href="/icon.svg">` from `app/icon.svg`.

### 7.2 `app/apple-icon.tsx` (new) — 180×180 generated PNG

```tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f0ec',
        color: '#0a0908',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontWeight: 700,
        fontSize: 116,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
      }}
    >
      M<span style={{ color: '#1f3a5f' }}>.</span>
    </div>,
    { ...size },
  );
}
```

Notes:

- Same monogram, sized for the Apple touch icon spec (180×180).
- `borderRadius: 36` — iOS clips icons to a rounded-square mask but rendering a matching radius is harmless and looks correct on non-iOS share previews.
- `app/apple-icon.tsx` is preferred over a static PNG because it removes the asset-upload step. Next handles emitting `<link rel="apple-touch-icon" href="/apple-icon">` automatically.

## 8. CV-link swap details

Three call sites touch the resume URL today. All three should resolve to `/Resume_Mainul.pdf` after the Phase 7 swap.

### 8.1 `app/_lib/site-config.ts`

Already covered in §2.1 — `siteConfig.metaLinks` Resume entry now points at `cvHref` (which is `/Resume_Mainul.pdf`).

### 8.2 `app/_lib/about-content.ts` and `app/_lib/contact-content.ts`

Already covered in §2.2 / §2.3 — drop the TODO + Drive fallback, read `cvHref` directly from `siteConfig`.

### 8.3 Audit pass

Run a final grep across the codebase to confirm no remaining Drive references:

```bash
grep -rn "drive.google.com\|GHSA\|cv\.pdf" app/ public/ docs/
```

The only allowed hit is the `GHSA-` URL inside `docs/MASTERPLAN.md` (if it lands there from the audit note) and the literal `/Resume_Mainul.pdf` references. Verify before merging.

## 9. `npm audit` outcome

Running `npm audit` today reports:

```
postcss  <8.5.10
Severity: moderate
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output
fix available via `npm audit fix --force`
Will install next@9.3.3, which is a breaking change
node_modules/postcss
  next  9.3.4-canary.0 - 16.3.0-canary.5
  Depends on vulnerable versions of postcss
  node_modules/next
2 moderate severity vulnerabilities
```

Both moderates are the same upstream issue: `postcss <8.5.10` carries a CSS-output XSS advisory; `next` (across most of its release history, including the current 16.2.6) depends on a vulnerable version.

**Outcome for Phase 7:** **document, do not fix.** Reasons:

1. The fix path (`npm audit fix --force`) would downgrade `next` to **9.3.3** — a six-year-old release that predates the App Router. Catastrophic regression for zero security gain (the static portfolio site never renders user-controlled CSS via PostCSS at runtime).
2. The vulnerability requires PostCSS to stringify attacker-controlled CSS. The portfolio compiles author-controlled SCSS at build time only — there is no runtime user-CSS surface.
3. The patched PostCSS chain ships in Next 16.3+ (per the canaries listed in the audit output). When Next 16.3 stable ships, the lockfile updates automatically on the next `npm install` and the advisory drops off.

**Documentation:** add the following to `futureWorks.md` (Open section) so the rationale stays attached:

```
- [deps] `npm audit` reports 2 moderate (`postcss <8.5.10`, transitive via `next`). Not exploitable in this build context (PostCSS only stringifies build-time author SCSS). Fix would require downgrading Next to 9.3.3 — breaking change. Tracking Next 16.3 stable for an automatic upstream fix. — `feature/polish-and-launch` session 2026-05-23
```

Mark the original Phase 7 entry **resolved** (it asked for an audit, which has been performed and documented):

```
- [deps] `npm install` reports 2 moderate vulnerabilities. Resolved as documented exception — see new Open entry tracking Next 16.3 upstream patch. — `feature/polish-and-launch` 2026-05-23
```

## 10. Masterplan amendment

### 10.1 `docs/MASTERPLAN.md` §3.1 (edit)

Add an amendment callout at the end of §3.1 (immediately before §3.2):

```md
> **Amendment 2026-05-23 (Phase 7):** the runtime accent switcher described above is **dropped from scope**. The `--accent` CSS variable stays fixed at `#1f3a5f` (ink navy) on every page. The 5-preset list and the `mn-accent-v2` localStorage convention are no longer planned — the accent is part of the design language, not a configurable user setting. The Variant A/B hero toggle (`§ 2 home-only`) is unaffected and stays. See `_plans/polish-and-launch-plan.md` for rationale.
```

### 10.2 `docs/MASTERPLAN.md` §16 changelog (edit)

Add an entry at the end of the changelog list:

```md
- **2026-05-23** — Phase 7 amendments: §3.1 — accent switcher dropped from scope (the Tweaks-panel accent control is no longer planned). §10 Phase 7 — CV self-hosted at `/Resume_Mainul.pdf` (not `/cv.pdf`); production domain `mainul.info`; per-case OG images added to scope.
```

Notes:

- Per masterplan §0: "Treat this document as living. If a phase's reality diverges materially from what's described here, update the masterplan and note the change at the bottom of the affected section."
- The amendment doesn't strip the original §3.1 content (5-preset table, etc.). Leaving the history in place is the masterplan convention; the callout takes precedence.

## 11. `.env.example` (new)

```
# Public-facing absolute URL — used by metadataBase, OG og:url, sitemap, robots.txt.
# Set in Vercel project settings to the production URL.
# Default at build time falls back to https://mainul.info (the production domain).
NEXT_PUBLIC_SITE_URL=https://mainul.info

# Resend API key for the contact form. Required for /api/contact to send.
# Phase 5 — already documented in masterplan §12.
RESEND_API_KEY=re_xxxxxxxxxx

# "From" address Resend sends contact-form mail from. Must be a verified Resend sender.
CONTACT_FROM=Mainul Islam <hello@mainul.info>

# Address that receives contact-form submissions.
CONTACT_TO=m.main2402@gmail.com
```

Notes:

- `.env.example` is a documentation file (no real secrets); it gets committed. The project's `.gitignore` already ignores `.env.local`.
- Masterplan §12 mentioned `.env.local.example` would land "in the repo with the keys + descriptions"; this is that file, named `.env.example` to match the more common convention (both filenames are recognised by tooling like Vercel).

## 12. `futureWorks.md` updates

### 12.1 Resolved-section entries

Move the following from Open → Resolved (or just add the Resolved entries with the resolving session noted):

```
## Resolved

- [routes] `SelectedWork` rows on `/` link to `/work/avsb`, `/work/kemon-doctor`, `/work/client`. Resolved — all three case routes ship in Phase 6. — `feature/work-and-cases` 2026-05-23
- [scaffold] Add a real favicon — `app/icon.svg` + `app/apple-icon.tsx` ship in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [assets] `/cv.pdf` self-hosting — shipped as `/Resume_Mainul.pdf` in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [deps] `npm audit` 2 moderate vulnerabilities — documented exception (transitive `postcss <8.5.10` via `next`; no exploit surface in this build). Tracking Next 16.3 stable. — `feature/polish-and-launch` 2026-05-23
- [perf] Pre-hydration accent application — won't-fix; the accent switcher itself is dropped from scope (see masterplan §3.1 amendment). — `feature/polish-and-launch` 2026-05-23
```

### 12.2 New Open entries

```
- [deps] `npm audit` reports 2 moderate (`postcss <8.5.10`, transitive via `next`). Not exploitable in this build context (PostCSS only stringifies build-time author SCSS). Fix would require downgrading Next to 9.3.3 — breaking change. Tracking Next 16.3 stable for an automatic upstream fix. — `feature/polish-and-launch` session 2026-05-23
- [deploy] DNS for `mainul.info` not configured by Phase 7 PR — Vercel domain binding + apex/CNAME records remain a manual outside-the-repo step. — `feature/polish-and-launch` session 2026-05-23
```

(The first Open entry is the documented exception that pairs with the resolution. The point is to keep _why we're living with this_ visible.)

## 13. Verification checklist

Run before marking complete. Order matters: anything that produces an absolute URL has to be checked _on the Vercel deploy preview_, not locally.

### 13.1 Local

1. `npm run typecheck` — clean.
2. `npm run lint` — clean.
3. `npm run build` — clean. Confirm the build log includes the new routes: `○ /opengraph-image`, `○ /twitter-image`, `○ /work/avsb/opengraph-image`, etc.
4. `npm run dev` — visit each of the 7 public routes, plus `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `/apple-icon`, `/opengraph-image`, `/work/avsb/opengraph-image`, `/work/kemon-doctor/opengraph-image`, `/work/client/opengraph-image`. Each renders without console errors.
5. Visit `/foo-does-not-exist` — the designed 404 renders. The "Go to work index" `<Button>` lands on `/work`. "Or back home →" lands on `/`. Page source includes `<meta name="robots" content="noindex,nofollow">`.
6. View source on `/`, `/about`, `/contact`, `/work` — `<title>`, `<meta name="description">`, `<meta property="og:url">`, `<meta property="og:image">`, `<meta name="twitter:card">`, `<link rel="canonical">`, `<link rel="icon">`, `<link rel="apple-touch-icon">` all present. URLs are absolute (`http://localhost:3000/...` in dev, `https://mainul.info/...` in prod).
7. View source on `/work/avsb`, `/work/kemon-doctor`, `/work/client` — `og:image` resolves to the case-specific OG endpoint (`/work/avsb/opengraph-image` not `/opengraph-image`).
8. Click "Resume / CV" in the nav-meta links (Footer), the About resume button, and the Contact `Resume` direct line — each opens `/Resume_Mainul.pdf` in a new tab. No Google Drive viewer.
9. Browser tab favicon — `app/icon.svg` renders. iOS Safari → Add to Home Screen → uses the 180×180 generated apple-icon.
10. Keyboard pass on the 404 page — Tab → focus reaches the primary `<Button>`, then the home link, then the footer links. Visible focus rings on each.
11. `prefers-reduced-motion: reduce` (DevTools → Rendering) — the 404 page CTA cluster, the home link hover transition all skip. Final visual identical.

### 13.2 Deploy-preview (Vercel)

12. Push the branch; wait for the Vercel preview deploy. The preview's `NEXT_PUBLIC_SITE_URL` should be set to the preview URL.
13. Visit `<preview>/sitemap.xml` → valid XML with 7 entries, absolute URLs.
14. Visit `<preview>/robots.txt` → `User-agent: *` + `Allow: /` + `Sitemap: <preview>/sitemap.xml`.
15. Visit `<preview>/opengraph-image` → renders the root OG (1200×630 PNG). View it in the browser; eyeball the type weight + accent dot.
16. Visit each `<preview>/work/<slug>/opengraph-image` → case-specific OG renders the correct hero treatment.
17. Paste `<preview>/` into Slack → OG card renders. Paste `<preview>/work/avsb` → AvsB-specific OG card renders. Same in Twitter (or X) and iMessage. **If a card looks wrong on first paste, append `?v=1` and re-paste — most cache layers re-fetch on a different query string.**
18. Paste each URL into LinkedIn's [Post Inspector](https://www.linkedin.com/post-inspector/) to verify card rendering before any real post.

### 13.3 Lighthouse pass

For each of the 7 routes, run Chrome DevTools → Lighthouse → Mobile preset, all 4 categories. Target:

- Performance ≥ 90
- Accessibility ≥ 95 (aim for 100)
- Best Practices = 100
- SEO = 100

Record the scores in the spec retrospective. If a score falls below the target, name the specific axe rule / failing audit in the retrospective and either fix or document an exception.

### 13.4 Real-device pass

19. iPhone 12 (DevTools device toolbar): every page reads, no layout breaks. Spot-check the home hero, work index, AvsB case hero, contact form.
20. Pixel 5 (DevTools device toolbar): same as above.
21. iPad Mini (DevTools device toolbar): same; check the case-block sticky side becomes static at ≤900px.
22. iPhone SE 1st gen (320px width, custom DevTools size): each page reads without horizontal scroll. The 320px guardrails from Phases 4–6 should hold; this is a verification step.
23. If real hardware is available: repeat 19–22 on actual devices. If not, log a `futureWorks.md` line: `[verify] confirm 320px guardrail on a real iPhone SE 1st-gen post-launch — `feature/polish-and-launch` 2026-05-23`.

### 13.5 Email rendering pass

24. Submit a real entry through the contact form on the preview URL.
25. Open the notification email in: Gmail web, Gmail iOS, Apple Mail (macOS), Outlook web. Verify each renders the layout intact — no broken HTML, no missing CSS, no images broken.
26. Repeat for the confirmation email. If any client breaks, capture a screenshot and either fix the template inline or log a follow-up entry to `futureWorks.md`.

### 13.6 npm audit verification

27. `npm audit` — confirm the report still shows only the 2 documented `postcss` moderates and no new advisories.
28. `npm outdated` — verify no direct deps have major-version updates pending that we'd want to incorporate (Phase 7 is not a dep-bump phase, but flagging anything new is useful).

## 14. Open questions / explicit assumptions

- **`mainul.info` DNS state.** The spec assumes the env var defaults to `https://mainul.info`. If DNS isn't configured by the time the PR opens, the Vercel preview will use its auto-generated URL anyway (Vercel sets `NEXT_PUBLIC_SITE_URL` to the preview URL); production go-live happens whenever DNS lands. No code change needed in either order.
- **`NEXT_PUBLIC_SITE_URL` in Vercel.** Must be set in the Vercel project settings (not in `vercel.json`) to apply to deploy previews automatically. The spec verification step 12 confirms the preview's metadata reflects the right URL before merging.
- **`app/opengraph-image.tsx` build-time `frontmatter` import.** The per-case OG files import `frontmatter` from `./content.mdx`. The `mdx-custom.d.ts` declaration from Phase 6 (`declare module '*.mdx' { export const frontmatter: CaseFrontmatter; }`) types this. If `@next/mdx`'s loader handling of named exports changes in a future Next version, the per-case OG files would need to switch to importing `frontmatter` from a separate JSON/TS file. Not a current risk; flagging for future-proofing.
- **`ImageResponse` Edge runtime.** Each `opengraph-image.tsx` declares `runtime = 'edge'`. The Edge runtime has restrictions (no `fs`, no Node `crypto`, etc.), but the current implementation needs none of those — it imports a typed object and renders JSX.
- **`twitter-image` re-export TypeScript.** Re-exporting `runtime` as a const string from a sibling module is unusual; if TypeScript's strict mode complains, fall back to authoring each `twitter-image.tsx` independently (5 minutes of duplication, no other implication).
- **`app/icon.svg` browser support.** Some older Safari versions (≤14) treat SVG favicons as broken. `app/apple-icon.tsx` covers iOS; desktop Safari 15+ is fine. Other browsers (Chrome 80+, Firefox 41+) have full support.
- **Verification step 8 (`grep` for `drive.google.com`).** This is a final cleanup gate, not a real test. The grep should return zero matches in `app/`, `public/`, `docs/`. Any match outside those (eg in `_plans/` or `_specs/` history) is documentation and stays.
- **Lighthouse fluctuation on perf.** Lighthouse perf scores fluctuate ±3 on identical runs. If a score lands at 88 ≠ 90 on the first run, re-run before declaring a regression. The verification target says "≥ 90" not "= 90" for exactly this reason.
- **Email rendering on Outlook web.** Outlook web has notoriously inconsistent HTML email handling. If a small layout artefact appears (eg slightly broken table spacing), it's acceptable per `futureWorks.md` follow-up; if the email is unreadable, fix before merging.
- **No CI workflow.** Phase 7 keeps the local-only policy (`CLAUDE.md`). Lighthouse, audit, and visual verification run by hand once; CI would be a separate chore phase.
