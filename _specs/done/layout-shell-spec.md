# Spec — Layout shell (Phase 3)

**Status:** Draft — awaiting approval
**Date:** 2026-05-22
**Branch:** `feature/layout-shell`
**Plan:** `_plans/layout-shell-plan.md`
**Masterplan reference:** `docs/MASTERPLAN.md` §5.1, §7, §8, §10
**Source of truth (markup):** `Mainul's Portfolio/index.html`
**Source of truth (styles):** `Mainul's Portfolio/assets/shared.css`
**Source of truth (behaviours):** `Mainul's Portfolio/assets/shared.js`

---

## 0. Recap

Build the site chrome — Nav, Footer, CustomCursor, Reveal pipeline — plus the universal layout primitives (Container, Section, SectionHead, PageIntro, Button, TextLink, Arrow, TickRule, MonoLabel, Tag) so every page from Phase 4+ becomes pure composition.

No new npm dependencies. No analytics or third-party scripts.

## 1. New files

```
app/
├── layout.tsx                                    ← REWRITE
├── page.tsx                                      ← MINOR EDIT (wrap in <Container>/<Section>)
├── _styles/
│   └── globals.scss                              ← APPEND .reveal rules
├── _lib/
│   └── site-config.ts                            ← NEW
└── _components/
    ├── Arrow/
    │   └── Arrow.tsx
    ├── Container/
    │   └── Container.tsx
    ├── Section/
    │   └── Section.tsx
    ├── SectionHead/
    │   └── SectionHead.tsx
    ├── PageIntro/
    │   └── PageIntro.tsx
    ├── TickRule/
    │   └── TickRule.tsx
    ├── MonoLabel/
    │   └── MonoLabel.tsx
    ├── Tag/
    │   ├── Tag.tsx
    │   └── _Tag.module.scss
    ├── Button/
    │   ├── Button.tsx
    │   └── _Button.module.scss
    ├── TextLink/
    │   ├── TextLink.tsx
    │   └── _TextLink.module.scss
    ├── Nav/
    │   ├── Nav.tsx
    │   └── _Nav.module.scss
    ├── Footer/
    │   ├── Footer.tsx
    │   └── _Footer.module.scss
    ├── CustomCursor/
    │   ├── CustomCursor.tsx
    │   └── _CustomCursor.module.scss
    ├── Reveal/
    │   └── Reveal.tsx
    └── RevealRoot/
        └── RevealRoot.tsx
```

Eighteen new files, two edits.

**No `index.ts` re-exports anywhere.** Every consumer imports the named file directly.

## 2. `app/_lib/site-config.ts`

The single source of truth for chrome content. Strict TS types so a typo at a call site fails the typecheck.

```ts
export type NavLink = {
  /** Two-digit ordinal — rendered as the small accent prefix on desktop. */
  num: string;
  /** Display label. */
  label: string;
  /** Absolute pathname starting with `/`. */
  href: string;
};

export type MetaLink = {
  label: string;
  href: string;
  /** External links get target=_blank rel=noopener noreferrer. */
  external?: boolean;
};

export const siteConfig = {
  ownerName: 'Mainul Islam',
  email: 'm.main2402@gmail.com',
  /** Portfolio version + year string, rendered in the footer bottom row. */
  version: 'v3',
  year: '2026',
  navLinks: [
    { num: '01', label: 'Index', href: '/' },
    { num: '02', label: 'Work', href: '/work' },
    { num: '03', label: 'About', href: '/about' },
    { num: '04', label: 'Contact', href: '/contact' },
  ] satisfies readonly NavLink[],
  metaLinks: [
    { label: 'GitHub ↗', href: 'https://github.com/main1479', external: true },
    {
      label: 'Resume / CV ↗',
      href: 'https://drive.google.com/file/d/1zp7JQLgPNyEQan9bzKnLN2i-t1Du_tgI/view',
      external: true,
    },
    { label: 'Email ↗', href: 'mailto:m.main2402@gmail.com' },
  ] satisfies readonly MetaLink[],
  footerCta: {
    /** First line; second line is the email rendered as a `<a href="mailto:">`. */
    lead: 'Say hello —',
  },
} as const;

export type SiteConfig = typeof siteConfig;
```

Notes:

- `satisfies readonly NavLink[]` (not a plain annotation) keeps the literal types so `siteConfig.navLinks[0].label` is `'Index'`, not `string`.
- `as const` on the wrapper freezes the object so consumers can't mutate it.
- Phase 7 swaps the Drive URL for `/cv.pdf` here only.

## 3. Component specs

### 3.1 `Arrow/Arrow.tsx`

Server component. The one SVG arrow used across the whole site.

```tsx
type Props = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Arrow({ size = 16, strokeWidth = 1.5, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
```

`aria-hidden="true"` because the arrow is decorative — every place we use it pairs it with text (the link label) or wraps a labelled button (`aria-label="…"`). Path data matches `index.html` exactly.

### 3.2 `Container/Container.tsx`

Server component. Pure markup over the existing `.container` / `.container--narrow` global classes.

```tsx
type Props = {
  narrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Container({ narrow, className, children }: Props) {
  const cls = ['container', narrow ? 'container--narrow' : '', className].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}
```

No module SCSS. Reads `.container` and `.container--narrow` from `_utils.scss`.

### 3.3 `Section/Section.tsx`

Server component. Wraps content in vertical-rhythm padding via the global `.section`. Optional `first` prop drops the top padding when the section is the first on a page (e.g. the home hero).

```tsx
type Props = {
  first?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function Section({ first, id, className, children, ariaLabel }: Props) {
  const cls = ['section', first ? 'section--first' : '', className].filter(Boolean).join(' ');
  return (
    <section className={cls} id={id} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
```

**Add to `_styles/_utils.scss`:** a tiny rule for `.section--first { padding-top: 0; }`. This was deferred from the Phase 2 spec ("future `.section--first` … lands with `<Section>` component"). One line, no new file.

### 3.4 `SectionHead/SectionHead.tsx`

Server component. Mono index label + display title with optional accent fragment.

```tsx
type Props = {
  /** e.g. "01 / Index" — rendered in mono caps */
  index: string;
  /** Plain title; for an accent split use `titleNodes` instead */
  title?: string;
  /** Pre-rendered title with <span className="accent">…</span> if needed */
  titleNodes?: React.ReactNode;
  className?: string;
};

export function SectionHead({ index, title, titleNodes, className }: Props) {
  return (
    <header className={['section__head', className].filter(Boolean).join(' ')}>
      <span className="section__index">{index}</span>
      <h2 className="section__title">{titleNodes ?? title}</h2>
    </header>
  );
}
```

Reads `.section__head`, `.section__index`, `.section__title`, `.section__title .accent` from `_utils.scss`. `<h2>` is the default — pages with `<h1 className="display display-xl">` from a `<PageIntro>` get the right heading order.

### 3.5 `PageIntro/PageIntro.tsx`

Server component. The big-label + display-title block used on `/work`, `/about`, `/contact`, and case pages.

```tsx
type Props = {
  /** e.g. "02 / Work Index" */
  label: string;
  /** Plain title text */
  title?: string;
  /** Pre-rendered title with line breaks / accent spans */
  titleNodes?: React.ReactNode;
  /** Optional sub-paragraph below the title */
  sub?: React.ReactNode;
  className?: string;
};

export function PageIntro({ label, title, titleNodes, sub, className }: Props) {
  return (
    <header className={['page-intro', className].filter(Boolean).join(' ')}>
      <span className="page-intro__label">{label}</span>
      <h1 className="page-intro__title">{titleNodes ?? title}</h1>
      {sub && <p className="page-intro__sub">{sub}</p>}
    </header>
  );
}
```

All styles already live in `globals.scss`. The `<h1>` is the page's primary heading.

### 3.6 `TickRule/TickRule.tsx`

Server component. Renders 21 spans inside the global `.tick-rule` markup. `aria-hidden` because it's decorative.

```tsx
const MARKS = Array.from({ length: 21 }, (_, i) => i);

export function TickRule({ className }: { className?: string }) {
  return (
    <div className={['tick-rule', className].filter(Boolean).join(' ')} aria-hidden="true">
      <div className="tick-rule__marks">
        {MARKS.map((i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}
```

No module SCSS — `.tick-rule` already lives in `_utils.scss`.

### 3.7 `MonoLabel/MonoLabel.tsx`

Server component. Polymorphic wrapper around `.mono` / `.mono-sm`.

```tsx
type Props<T extends React.ElementType = 'span'> = {
  as?: T;
  size?: 'default' | 'sm';
  className?: string;
  children: React.ReactNode;
};

export function MonoLabel<T extends React.ElementType = 'span'>({
  as,
  size = 'default',
  className,
  children,
}: Props<T>) {
  const Tag = (as ?? 'span') as React.ElementType;
  const cls = [size === 'sm' ? 'mono-sm' : 'mono', className].filter(Boolean).join(' ');
  return <Tag className={cls}>{children}</Tag>;
}
```

Style classes come from `_typography.scss`. Polymorphic so the same component can render `<p>`, `<dt>`, `<time>`, etc.

### 3.8 `Tag/Tag.tsx` + `_Tag.module.scss`

Server component. Small rounded pill, mono uppercase. Used for case-block tags and service tags.

```tsx
import styles from './_Tag.module.scss';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className }: Props) {
  return <span className={[styles.tag, className].filter(Boolean).join(' ')}>{children}</span>;
}
```

```scss
.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--rule-strong);
  font-family: var(--font-mono);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-soft);
  line-height: 1.2;
}
```

Neutral by default; pages compose modifiers as they need them.

### 3.9 `Button/Button.tsx` + `_Button.module.scss`

Server component when used as a link or unhandled button. Becomes implicitly client when wrapped in a parent that passes `onClick` (parent decides).

```tsx
import Link from 'next/link';
import { Arrow } from '../Arrow/Arrow';
import styles from './_Button.module.scss';

type Variant = 'default' | 'ghost' | 'accent';

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  /** Show the trailing arrow (right-shifts on hover). Default true. */
  arrow?: boolean;
  /** Override the arrow with a custom glyph (e.g. ↓ for downloads). */
  arrowGlyph?: React.ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
  external?: boolean;
  type?: never;
  onClick?: never;
};

type ButtonProps = CommonProps & {
  href?: never;
  external?: never;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

type Props = AnchorProps | ButtonProps;

function classNames(variant: Variant, className?: string) {
  return [
    styles.btn,
    variant === 'ghost' ? styles.btnGhost : '',
    variant === 'accent' ? styles.btnAccent : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

function inner(children: React.ReactNode, arrow: boolean, arrowGlyph?: React.ReactNode) {
  return (
    <>
      <span>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          {arrowGlyph ?? <Arrow size={14} />}
        </span>
      )}
    </>
  );
}

export function Button(props: Props) {
  const { variant = 'default', className, children, arrow = true, arrowGlyph } = props;
  const cls = classNames(variant, className);
  const body = inner(children, arrow, arrowGlyph);

  if ('href' in props && props.href !== undefined) {
    const isExternal = props.external || /^(https?:|mailto:)/.test(props.href);
    if (isExternal) {
      return (
        <a
          href={props.href}
          className={cls}
          target={props.href.startsWith('mailto:') ? undefined : '_blank'}
          rel={props.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
        >
          {body}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {body}
      </Link>
    );
  }

  return (
    <button type={props.type ?? 'button'} onClick={props.onClick} className={cls}>
      {body}
    </button>
  );
}
```

```scss
.btn {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 18px 28px;
  background: var(--fg);
  color: var(--bg);
  font-family: var(--font-mono);
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  isolation: isolate;

  @include reduced-motion-safe {
    transition: color 0.4s var(--ease-out);
  }
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: translateY(100%);
  z-index: -1;

  @include reduced-motion-safe {
    transition: transform 0.5s var(--ease-out);
  }
}

.btn:hover {
  color: var(--accent-ink);
}

.btn:hover::before {
  transform: translateY(0);
}

.arrow {
  display: inline-flex;
  align-items: center;

  @include reduced-motion-safe {
    transition: transform 0.4s var(--ease-out);
  }
}

.btn:hover .arrow {
  transform: translateX(4px);
}

.btnGhost {
  background: transparent;
  color: var(--fg);
  border: 1px solid var(--fg);
}

.btnGhost:hover {
  color: var(--accent-ink);
}

.btnAccent {
  background: var(--accent);
  color: var(--accent-ink);
}

.btnAccent::before {
  background: var(--fg);
}

.btnAccent:hover {
  color: var(--bg);
}

// Phone — tighten padding
@media (max-width: 640px) {
  .btn {
    padding: 12px 18px;
    font-size: 1rem;
    gap: 8px;
  }
}

// Visible keyboard focus state (designed, not browser-default)
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
```

Notes:

- The discriminated `AnchorProps | ButtonProps` union prevents calling `<Button onClick={…} href="…">` at compile time. Each path renders the right element.
- External links default to `target="_blank" rel="noopener noreferrer"` per `accessibility.md` and security rules. `mailto:` keeps the same window.
- The `:focus-visible` ring is intentionally on the button itself, not the arrow.

### 3.10 `TextLink/TextLink.tsx` + `_TextLink.module.scss`

Server component. Underlined inline link with the arrow motif (`.tlink`).

```tsx
import Link from 'next/link';
import { Arrow } from '../Arrow/Arrow';
import styles from './_TextLink.module.scss';

type Props = {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Render the arrow as ↗ (up-right) instead of the default → */
  upRight?: boolean;
};

export function TextLink({ href, external, children, className, upRight }: Props) {
  const cls = [styles.tlink, className].filter(Boolean).join(' ');
  const isExternal = external || /^(https?:|mailto:)/.test(href);
  const arrow = upRight ? (
    <span className={styles.arrow} aria-hidden="true">
      ↗
    </span>
  ) : (
    <span className={styles.arrow} aria-hidden="true">
      <Arrow size={14} />
    </span>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={cls}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      >
        {children}
        {arrow}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}
```

```scss
.tlink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding-bottom: 4px;
  font-weight: 500;
  border-bottom: 1px solid var(--rule-strong);

  @include reduced-motion-safe {
    transition:
      color 0.3s,
      border-color 0.3s;
  }
}

.tlink:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.arrow {
  display: inline-flex;
  align-items: center;

  @include reduced-motion-safe {
    transition: transform 0.4s var(--ease-out);
  }
}

.tlink:hover .arrow {
  transform: translateX(3px) translateY(-3px);
}

.tlink:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}
```

### 3.11 `Reveal/Reveal.tsx`

Server component. Renders a wrapper with `className="reveal"` (literal string, not a module class — `RevealRoot` queries `.reveal` globally) and optional `data-delay`.

```tsx
type Props = {
  /** 1–5, mapped to the data-delay attribute the global CSS stagger reads. */
  delay?: 1 | 2 | 3 | 4 | 5;
  /** Element to render — defaults to <div>. */
  as?: 'div' | 'section' | 'article' | 'header' | 'li' | 'span';
  className?: string;
  children: React.ReactNode;
};

export function Reveal({ delay, as = 'div', className, children }: Props) {
  const Tag = as;
  const cls = ['reveal', className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} data-delay={delay}>
      {children}
    </Tag>
  );
}
```

The `<Reveal>` ships as inert HTML; the `RevealRoot` IntersectionObserver flips `.is-inview` on intersect. Reduced-motion users skip the transform via the `globals.scss` safety net.

### 3.12 `RevealRoot/RevealRoot.tsx`

Client component. Single observer for every `.reveal` in the page. Re-binds on pathname change so client navigations work.

```tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RevealRoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const nodes = document.querySelectorAll('.reveal:not(.is-inview)');
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-inview');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    nodes.forEach((node) => io.observe(node));

    return () => {
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
```

Notes:

- Selector excludes `.is-inview` so the new observer doesn't re-watch nodes that already finished revealing.
- `disconnect()` in cleanup prevents leaking observers across route changes.
- Re-runs on `pathname` change to catch any `.reveal` nodes mounted by the new route.

### 3.13 `CustomCursor/CustomCursor.tsx` + `_CustomCursor.module.scss`

Client component. Renders nothing during SSR. On mount, checks `matchMedia('(hover: hover) and (pointer: fine)')` — bails out (returns `null`) if it doesn't match. Otherwise renders a `<div className="cursor">` and drives it with `requestAnimationFrame`.

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './_CustomCursor.module.scss';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
    setEnabled(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = cursorRef.current;
    if (!el) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let rafId = 0;
    let hasMoved = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        el.style.opacity = '1';
      }
    };
    const tick = () => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(tick);
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && !!target.closest('a, button, [data-cursor="hover"]');

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) el.classList.add(styles.isHover);
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) el.classList.remove(styles.isHover);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />;
}
```

```scss
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  pointer-events: none;
  z-index: 9999;
  opacity: 0;
  transform: translate(-50%, -50%);

  @include reduced-motion-safe {
    transition:
      width 0.25s var(--ease-out),
      height 0.25s var(--ease-out),
      background 0.25s,
      opacity 0.2s;
  }
}

.isHover {
  width: 56px;
  height: 56px;
  background: transparent;
  border: 1px solid var(--fg);
}

// Belt-and-braces: hide on touch even if matchMedia gave us a false positive.
@media (hover: none), (pointer: coarse) {
  .cursor {
    display: none !important;
  }
}
```

Notes:

- Starts at `opacity: 0`; first mousemove flips it to `1`. Prevents the "ghost dot in the top-left" flash.
- `pointer-events: none` keeps it from intercepting clicks.
- Listening to the media-query `change` event means an external monitor unplug (pointer changes to coarse) cleanly tears down the cursor.

### 3.14 `Nav/Nav.tsx` + `_Nav.module.scss`

Client component. Fixed top, scroll-state class, mobile drawer with focus trap.

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { siteConfig } from '../../_lib/site-config';
import styles from './_Nav.module.scss';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Scroll state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Body scroll lock + Escape close + initial focus when drawer opens
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstLink = drawerRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const onToggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <nav
      className={[styles.nav, scrolled ? styles.scrolled : '', open ? styles.isOpen : '']
        .filter(Boolean)
        .join(' ')}
      aria-label="Primary"
    >
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.mark} aria-label="Home">
          <span>{siteConfig.ownerName.split(' ')[0]}</span>
          <span className={styles.dot} aria-hidden="true" />
        </Link>

        <div
          ref={drawerRef}
          id={drawerId}
          className={styles.links}
          role="menu"
          aria-hidden={!open && undefined}
        >
          {siteConfig.navLinks.map((link) => {
            const current = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[styles.link, current ? styles.isCurrent : ''].filter(Boolean).join(' ')}
                aria-current={current ? 'page' : undefined}
                role="menuitem"
              >
                <span className={styles.num}>{link.num}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={drawerId}
          onClick={onToggle}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
```

```scss
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 80;
  padding: 22px 0;
  pointer-events: none;

  @include reduced-motion-safe {
    transition: background 0.5s var(--ease-out);
  }
}

.scrolled {
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
}

.mark {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
}

.dot {
  width: 9px;
  height: 9px;
  background: var(--accent);
  display: inline-block;
  border-radius: 50%;

  @include reduced-motion-safe {
    animation: nav-pulse 2.4s ease-in-out infinite;
  }
}

.links {
  display: flex;
  gap: clamp(18px, 2.5vw, 36px);
  align-items: center;
}

.link {
  font-family: var(--font-mono);
  font-size: 1.15rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  position: relative;
  padding: 6px 2px;
  color: var(--fg-soft);

  @include reduced-motion-safe {
    transition: color 0.3s;
  }
}

.link::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: var(--fg);
  transform: scaleX(0);
  transform-origin: left;

  @include reduced-motion-safe {
    transition: transform 0.4s var(--ease-out);
  }
}

.link:hover,
.isCurrent {
  color: var(--fg);
}

.link:hover::after,
.isCurrent::after {
  transform: scaleX(1);
}

.num {
  color: var(--accent);
  margin-right: 6px;
  font-weight: 500;
}

.link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: 2px;
}

// Hamburger toggle — hidden on desktop, visible on phones
.toggle {
  display: none;
  width: 40px;
  height: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 0;
  padding: 8px;
  cursor: pointer;
  z-index: 90;
  pointer-events: auto;
}

.toggle span {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--fg);
  transform-origin: center;

  @include reduced-motion-safe {
    transition:
      transform 0.35s var(--ease-out),
      opacity 0.25s;
  }
}

.toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.isOpen .toggle span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.isOpen .toggle span:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.isOpen .toggle span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

// Laptop-portrait
@media (max-width: 1100px) {
  .num {
    display: none;
  }
  .links {
    gap: 16px;
  }
}

@media (max-width: 900px) {
  .nav {
    padding: 18px 0;
  }
  .mark {
    font-size: 2.2rem;
  }
  .links {
    gap: 12px;
  }
  .link {
    font-size: 1.05rem;
  }
  .num {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav {
    padding: 14px 0;
  }
  .mark {
    font-size: 1.9rem;
  }
  .toggle {
    display: flex;
  }
  .links {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--bg);
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 84px var(--gutter) 36px;
    transform: translateY(-100%);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
    border-bottom: 1px solid var(--rule);

    @include reduced-motion-safe {
      transition: transform 0.5s var(--ease-out);
    }
  }
  .isOpen .links {
    transform: translateY(0);
  }
  .link {
    font-family: var(--font-display);
    font-size: 3.4rem;
    line-height: 1.1;
    padding: 10px 0;
    color: var(--fg);
    letter-spacing: 0.005em;
    width: 100%;
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: baseline;
    gap: 14px;
  }
  .link:last-child {
    border-bottom: 0;
  }
  .link::after {
    display: none;
  }
  .num {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 1.1rem;
    color: var(--fg-muted);
    margin-right: 0;
  }
  .isCurrent {
    color: var(--accent);
  }
}

@media (max-width: 380px) {
  .mark {
    font-size: 1.6rem;
  }
  .link {
    font-size: 2.8rem;
  }
}
```

Notes:

- `role="menu"` + `role="menuitem"` on the link list mirrors the static template's intent. `aria-current="page"` on the active link is the semantic standard for "this is where you are."
- The toggle uses `aria-expanded` and `aria-controls` pointing at the `useId()`-generated drawer id, so screen readers can describe the relationship.
- Focus trap only activates while `open` is true. Tab + Shift+Tab cycle within the drawer; Escape closes and returns focus to the toggle.
- `pointer-events: none` on the nav root with `auto` re-enabled on `.inner` and `.toggle` matches the source's "transparent fixed bar that only intercepts clicks where there's content."
- `useId()` avoids hydration ID mismatches.

### 3.15 `Footer/Footer.tsx` + `_Footer.module.scss`

Server component. The default chrome footer. Heading is `<h2>`. Stroked wordmark is `aria-hidden`.

```tsx
import { siteConfig } from '../../_lib/site-config';
import styles from './_Footer.module.scss';

type Props = {
  heading?: React.ReactNode;
  metaLinks?: typeof siteConfig.metaLinks;
};

export function Footer({ heading, metaLinks = siteConfig.metaLinks }: Props) {
  const defaultHeading = (
    <>
      {siteConfig.footerCta.lead}
      <br />
      <a href={`mailto:${siteConfig.email}`}>
        {siteConfig.email.split('@')[0]}
        <wbr />@{siteConfig.email.split('@')[1]}
      </a>
    </>
  );

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.top}>
          <h2 className={styles.cta}>{heading ?? defaultHeading}</h2>
          <div className={styles.meta}>
            {metaLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className={styles.mark} aria-hidden="true">
          {siteConfig.ownerName.split(' ')[0]}
        </div>
        <div className={styles.bottom}>
          <span>
            © {siteConfig.year} {siteConfig.ownerName}
          </span>
          <span className={styles.center}>Frontend · Experimentation</span>
          <span className={styles.right}>{siteConfig.version} · Built with care</span>
        </div>
      </div>
    </footer>
  );
}
```

```scss
.footer {
  padding: clamp(80px, 10vw, 160px) 0 40px;
  position: relative;
  background: var(--fg);
  color: var(--bg);
}

.container {
  color: var(--bg);
}

.mark {
  font-family: var(--font-display);
  font-size: clamp(12rem, 24vw, 36rem);
  line-height: 0.82;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin: 0;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--bg);
  display: block;
}

.top {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 60px;
  align-items: end;
  padding-bottom: 80px;
  border-bottom: 1px solid rgba(245, 240, 236, 0.18);
}

.cta {
  font-family: var(--font-display);
  font-size: clamp(3.6rem, 5vw, 7rem);
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
  letter-spacing: -0.005em;
  overflow-wrap: anywhere;
  min-width: 0;
}

.cta a {
  display: inline-block;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 4px;

  @include reduced-motion-safe {
    transition: color 0.3s;
  }
}

.cta a:hover {
  color: var(--accent);
}

.cta a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 1.2rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.meta a {
  @include reduced-motion-safe {
    transition: color 0.3s;
  }
}

.meta a:hover {
  color: var(--accent);
}

.meta a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}

.bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  padding-top: 40px;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--bg) 60%, transparent);
}

.right {
  text-align: right;
}

.center {
  text-align: center;
}

@media (max-width: 768px) {
  .top {
    grid-template-columns: 1fr;
  }
  .bottom {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: left !important;
  }
  .right,
  .center {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .footer {
    padding: 56px 0 22px;
  }
  .mark {
    font-size: clamp(5rem, 19vw, 10rem);
    -webkit-text-stroke-width: 1px;
    line-height: 0.86;
  }
  .top {
    gap: 24px;
    padding-bottom: 40px;
  }
  .cta {
    font-size: clamp(2.6rem, 8vw, 4.2rem);
    line-height: 1.05;
    overflow-wrap: anywhere;
  }
  .cta a {
    display: inline;
    word-break: break-all;
  }
  .meta {
    font-size: 0.95rem;
  }
  .bottom {
    font-size: 0.85rem;
    padding-top: 20px;
  }
}

@media (max-width: 380px) {
  .cta {
    font-size: 2.4rem;
  }
}
```

The `<wbr>` inside the email split lets the email wrap cleanly at the `@` symbol on narrow viewports — same trick the static template uses.

## 4. `app/layout.tsx` rewrite

```tsx
import type { Metadata } from 'next';
import { Teko, Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import './_styles/globals.scss';
import { Nav } from './_components/Nav/Nav';
import { Footer } from './_components/Footer/Footer';
import { CustomCursor } from './_components/CustomCursor/CustomCursor';
import { RevealRoot } from './_components/RevealRoot/RevealRoot';

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
  title: 'Mainul Islam · Frontend Developer · A/B Testing & Experimentation',
  description:
    'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${teko.variable} ${josefin.variable} ${mono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RevealRoot />
        <CustomCursor />
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

**Skip-link styles** added to `globals.scss`:

```scss
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  background: var(--fg);
  color: var(--bg);
  padding: 12px 18px;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  z-index: 1000;

  @include reduced-motion-safe {
    transition: top 0.2s var(--ease-out);
  }
}

.skip-link:focus {
  top: 16px;
  outline: 2px solid var(--accent);
  outline-offset: 4px;
}
```

## 5. `globals.scss` additions

Append to the existing `globals.scss`:

```scss
// ===============================================================
// Reveal-on-scroll
// `<Reveal>` writes className="reveal" + optional data-delay.
// `<RevealRoot>` IntersectionObserver flips .is-inview on intersect.
// Reduced-motion users skip via the safety net above.
// ===============================================================
.reveal {
  opacity: 0;
  transform: translateY(28px);

  @include reduced-motion-safe {
    transition:
      opacity 1s var(--ease-out),
      transform 1s var(--ease-out);
  }
}

.reveal.is-inview {
  opacity: 1;
  transform: translateY(0);
}

.reveal[data-delay='1'] {
  transition-delay: 0.08s;
}
.reveal[data-delay='2'] {
  transition-delay: 0.16s;
}
.reveal[data-delay='3'] {
  transition-delay: 0.24s;
}
.reveal[data-delay='4'] {
  transition-delay: 0.32s;
}
.reveal[data-delay='5'] {
  transition-delay: 0.4s;
}
```

## 6. `_utils.scss` addition (one line)

```scss
.section--first {
  padding-top: 0;
}
```

## 7. `app/page.tsx` minor edit

Wrap the existing placeholder body in `<Container>` + `<Section first>` so we can see the chrome and spacing in action. No new copy:

```tsx
import { Container } from './_components/Container/Container';
import { Section } from './_components/Section/Section';

export default function Home() {
  return (
    <Section first>
      <Container>
        <h1>Portfolio scaffolded.</h1>
        <p>Phase 3 wires the chrome. Phase 4 ports the home page.</p>
      </Container>
    </Section>
  );
}
```

## 8. Commit plan inside `feature/layout-shell`

Five commits for reviewability — each commit leaves the branch in a buildable state.

1. `feat: add site-config and append .reveal + skip-link styles`
2. `feat: add layout primitives (Arrow, Container, Section, SectionHead, PageIntro, TickRule, MonoLabel, Tag, Reveal)`
3. `feat: add Button and TextLink with focus styles`
4. `feat: add CustomCursor and RevealRoot client components`
5. `feat: add Nav and Footer; wire chrome into root layout`

Each commit pushed. The PR happens via `/finish-feature` later, not now.

## 9. Accessibility considerations

| Concern             | Handling                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Heading order       | `<h1>` belongs to the page (via `<PageIntro>` on inner routes; the home will get its `<h1>` in Phase 4). The footer's "Say hello" is an `<h2>`. No skipped levels.  |
| Skip link           | Above-fold `.skip-link` becomes visible on focus and jumps to `#main-content`. Sized as a real button when revealed.                                                |
| Nav active state    | `aria-current="page"` on the active link.                                                                                                                           |
| Mobile drawer       | `aria-expanded`, `aria-controls`, focus trap, Escape close, body scroll lock, focus returns to toggle. Closes on route change.                                      |
| Custom cursor       | `aria-hidden="true"`. Never replaces the system cursor. Only renders on `(hover: hover) and (pointer: fine)`. Touch users get no markup.                            |
| Reveal-on-scroll    | Content is in the DOM and reachable from the moment of mount (`opacity: 0` is visual only). `prefers-reduced-motion: reduce` flips opacity/transform to visible.    |
| Touch targets       | Nav links at ≤640px are 3.4rem × ~64px tall (44px+ minimum). Footer meta links wrap their full label. Hamburger is 40×40 (close to the 44 floor; OK per WCAG note). |
| Focus-visible rings | Every interactive element (Nav links, hamburger, Buttons, TextLinks, Footer links, CTA email) gets a deliberate `:focus-visible` outline in the accent colour.      |
| Decorative SVGs     | `<Arrow>` defaults to `aria-hidden`. `<TickRule>` always `aria-hidden`. Footer wordmark `aria-hidden` (it's already announced by the heading).                      |
| Reduced motion      | Every transition/animation is wrapped in `@include reduced-motion-safe { … }`. The `globals.scss` `*` override catches anything that slips.                         |
| External links      | All `target="_blank"` links carry `rel="noopener noreferrer"` (Button, TextLink, Footer meta).                                                                      |
| Colour contrast     | `--fg` on `--bg` 17.4:1. `--bg` on `--fg` (footer) 17.4:1. `--accent` (#1f3a5f) on `--bg` 9.2:1. `--accent` on `--fg` 4.7:1 (AA body, AA large). All paths pass AA. |

## 10. Edge cases consolidated

| Case                                                             | Handling                                                                                                                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client navigates between routes while drawer is open             | Drawer closes (effect on `pathname`); focus returns to toggle implicitly because the toggle is still mounted.                                               |
| User toggles reduced-motion mid-session                          | All wrapped transitions disappear on next style recalc. The drawer still works (transform changes are instantaneous instead of animated).                   |
| User unplugs an external mouse and the laptop becomes touch-only | `MediaQueryList.change` fires → `enabled = false` → cursor unmounts. RAF loop and listeners are cleaned up.                                                 |
| `app/page.tsx` placeholder loses content                         | Doesn't matter; the chrome renders regardless.                                                                                                              |
| 404 page                                                         | Next's default 404 inherits the layout, so it gets the nav and footer for free.                                                                             |
| Drawer with zero links (unlikely but possible)                   | Focus trap's `focusables.length === 0` early-return prevents a crash; Escape still works.                                                                   |
| `usePathname()` during SSR                                       | Returns the current route in App Router; safe inside a client component.                                                                                    |
| `RevealRoot` mounted before any `.reveal` exists                 | `querySelectorAll('.reveal')` returns an empty NodeList; effect bails. New `.reveal` nodes added on a route change pick up on the next pathname effect.     |
| `<Reveal>` inside a server component                             | Fine — `<Reveal>` itself is a server component; no client boundary crossed.                                                                                 |
| Very long email user-part                                        | `<wbr>` lets the email wrap at `@`. On ≤640px, `word-break: break-all` lets the local-part wrap mid-string too.                                             |
| Backdrop-filter unsupported                                      | The `.scrolled` background uses `color-mix` for the fallback; without `backdrop-filter` the nav still gets a translucent cream cover.                       |
| `color-mix()` unsupported (very old browser)                     | Static fallback would be a hard-coded `rgba(…)` — but we target Next 16 baseline which only includes browsers with `color-mix` support. No fallback needed. |

## 11. Verify steps

Run from `/Users/mainul/Desktop/Practice_Projects/Portfolio`:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

In the browser:

1. **Desktop chrome:** open `http://localhost:3000`. Nav fixed top, mark + 4 links visible with `01–04` accent prefixes, custom cursor following pointer. Footer fills the bottom with stroked "Mainul" wordmark.
2. **Scroll state:** scroll down past ~30px. Nav background fades in (translucent cream + blur).
3. **Hover state:** hover any nav link → underline scales from left. Cursor expands to a 56px transparent ring.
4. **Skip link:** focus the page with Tab. Skip link slides down at top-left; Enter jumps to `<main>`.
5. **Tab order:** skip-link → nav mark → 4 nav links → hamburger toggle (focusable but visually hidden at desktop, still OK) → main content links/buttons → footer CTA → 3 meta links.
6. **Mobile drawer:** resize to ≤640px → hamburger appears, desktop links hide. Tap hamburger → drawer slides down, focus moves to first link. Tab cycles within drawer. Shift+Tab from first wraps to last. Escape closes; focus returns to the hamburger. Navigate to another route → drawer auto-closes.
7. **Touch simulation:** DevTools → Toggle device → iPhone. Cursor disappears. Hamburger works on tap.
8. **Reduced motion:** DevTools → Rendering → `prefers-reduced-motion: reduce`. Nav-dot pulse stops. Hover on nav: underline appears without slide. Cursor still moves (essential).
9. **Reveal:** temporarily wrap the placeholder `<h1>` with `<Reveal delay={2}>…</Reveal>` and confirm it fades + translates in when scrolled into view. Revert before commit.
10. **Active link:** visit `/work` (Next will 404 since the page doesn't exist; that's fine for this phase). The Nav's "02 / Work" link should still highlight as the active state because the URL matches.
11. **Lighthouse a11y:** Chrome DevTools → Lighthouse → Accessibility only → ≥95.
12. **Screen reader (smoke test):** macOS VoiceOver (Cmd+F5). Tab to Nav → reads "Home, link", "01, Index, current page, link", etc. Open mobile drawer → focus moves to first item, VO announces the new region.

## 12. Exit criteria

- Eighteen new files exist per §1, no `index.ts` re-exports anywhere.
- `app/layout.tsx` rewritten to render `skip-link + <RevealRoot /> + <CustomCursor /> + <Nav /> + <main>{children}</main> + <Footer />`.
- `globals.scss` has the `.reveal` rules + skip-link styles appended.
- `_utils.scss` has the `.section--first` one-liner.
- `npm run build`, `npx tsc --noEmit`, `npm run lint` all clean.
- Lighthouse a11y on `/` ≥95.
- Mobile drawer: open → tab cycles → Escape closes → focus returns to toggle. Verified manually.
- Custom cursor: follows pointer on a fine-pointer device, absent on touch.
- Reveal: a temp `<Reveal>` test confirms fade-in works; reverted before final commit.
- `futureWorks.md` updated with any single-line gaps (e.g. focus-trap simplicity, CV deferral note if not already present, screen-reader pass scope).

## 13. Out of scope (deferred)

- Anything home-page (Phase 4): `Hero`, `HeroVariantA/B`, `HeroBadge`, `Marquee`, `Intro`, `Stats`, `Services`, `SelectedWork`, `SelectedClients`, `Recognition`, `Experience`, `EndCTA`, `TweaksPanel`.
- About + Contact (Phase 5).
- Work index + cases (Phase 6).
- Self-hosted CV (Phase 7).
- Self-hosted favicon (already in `futureWorks.md`).
- Dark mode.
- New npm dependencies.
- Analytics, tracking, third-party widgets.
- A real screen-reader audit pass beyond the VoiceOver smoke test.
