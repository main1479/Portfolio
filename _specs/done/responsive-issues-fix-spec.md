# Responsive issues fix — spec

Technical breakdown of the 10 items in `_plans/responsive-issues-fix-plan.md`. All edits are SCSS-only or small TSX/copy edits — no type changes, no schema changes, no new dependencies.

---

## Files touched

| #   | File                                                           | Why                                                                   |
| --- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | `app/_components/home/SelectedWork/_SelectedWork.module.scss`  | Add 1300–900px breakpoint tuning                                      |
| 1   | `app/_components/home/Services/_Services.module.scss`          | Add 1300–900px breakpoint tuning                                      |
| 2   | `app/work/_components/IndexRow/_IndexRow.module.scss`          | Raise the existing 1100px breakpoint to ~1500px                       |
| 3   | `app/about/page.tsx`                                           | Wrap `<PageIntro>` in `<Container>`                                   |
| 3   | `app/contact/page.tsx`                                         | Wrap `<PageIntro>` in `<Container>`                                   |
| 4   | `app/about/_components/AboutBio/_AboutBio.module.scss`         | Replace `.body` font-size clamp                                       |
| 5   | `app/about/_components/AboutBio/_AboutBio.module.scss`         | Convert `.cardValue` from fixed `2.6rem` to fluid clamp + tablet rule |
| 6   | `app/_components/Experience/_Experience.module.scss`           | Add 1300–900px breakpoint tuning for `.role`, `.desc`                 |
| 7   | `app/contact/_contactPage.module.scss`                         | Switch `.grid` to single-column at all widths                         |
| 7   | `app/contact/page.tsx`                                         | Re-order: form first, aside (direct lines) second                     |
| 8   | `app/contact/_components/ContactForm/_ContactForm.module.scss` | Give inputs a fill + clearer border treatment                         |
| 9   | `app/contact/_components/ContactForm/ContactForm.tsx`          | Add subtitle under the form header                                    |
| 9   | `app/contact/_components/ContactForm/_ContactForm.module.scss` | Style the subtitle                                                    |
| 10  | `app/_components/Footer/_Footer.module.scss`                   | Add top margin on `.mark` + 1300–900px tuning on `.top` / `.cta`      |

---

## Detail per item

### 1 — Home: Selected Work + What I Do (1300–900px)

**SelectedWork** (`_SelectedWork.module.scss`)

Current desktop columns: `60px minmax(0, 1fr) minmax(0, 1.2fr) 100px` with title clamp `clamp(4.4rem, 6.5vw, 9.2rem)`. The vw middle term is fine at ≥1500px but the title gets squeezed against `.meta` in this band.

Add a new breakpoint between 900 and 1300:

```scss
@media (max-width: 1300px) and (min-width: 901px) {
  .row {
    grid-template-columns: 48px minmax(0, 1fr) minmax(0, 1fr) 80px;
    gap: clamp(16px, 2vw, 32px);
  }
  .title {
    font-size: clamp(3.8rem, 5.4vw, 6.8rem);
  }
  .meta {
    font-size: 1.4rem;
    max-width: 32ch;
  }
  .tags {
    font-size: 1rem;
  }
}
```

**Services** (`_Services.module.scss`)

3-column grid collapses to 1-column at 900px. Between 1300 and 900 the title `clamp(3.4rem, 4vw, 5.6rem)` reads too big next to the description; the tag chips also overlap into 2+ lines. Add:

```scss
@media (max-width: 1300px) and (min-width: 901px) {
  .service {
    padding: clamp(28px, 3vw, 40px) clamp(20px, 2.4vw, 28px);
    gap: 18px;
    min-height: 320px;
  }
  .title {
    font-size: clamp(2.6rem, 3.6vw, 4.2rem);
  }
  .desc {
    font-size: 1.4rem;
  }
  .tags span {
    font-size: 0.95rem;
    padding: 4px 8px;
  }
}
```

### 2 — /work index overlap (1500–900px)

Current breakpoints: full 6-col layout above 1100, collapse `.tags` and use a 5-col layout 1100–900, full tablet stack <900. The 5-col layout is fine; the _6-col_ layout breaks above 1100 once the viewport drops below ~1500 because `.title clamp(3.4rem, 5vw, 6.8rem)` + the meta + tags + year all share row space.

Change: raise the existing 1100 rule to **1500**, and add a small _intermediate_ tuning between 1500 and 1100 that keeps all 6 columns but reins in the type sizes so they don't overlap.

```scss
@media (max-width: 1500px) and (min-width: 1101px) {
  .link {
    grid-template-columns: 52px minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 0.9fr) 96px 52px;
    gap: clamp(14px, 1.8vw, 28px);
  }
  .title {
    font-size: clamp(3rem, 4.2vw, 5.4rem);
  }
  .meta {
    font-size: 1.4rem;
  }
  .tags,
  .year {
    font-size: 1rem;
  }
}
```

Existing `(max-width: 1100px)` rule (drops tags, 5 cols) stays as-is — it picks up cleanly below 1100.

### 3 — About + Contact: page-intro header has no side spacing

Both pages currently render `<PageIntro>` at top level (no `<Container>`). `PageIntro` has no horizontal padding of its own — it relies on a wrapping container for the gutter. `/work` already wraps it correctly.

`app/about/page.tsx` — wrap the `<PageIntro>` in `<Container>`.
`app/contact/page.tsx` — same.

### 4 — About bio: shrink font on mobile

`_AboutBio.module.scss` `.body`:

```scss
// before
font-size: clamp(1.9rem, 2vw, 2.6rem);

// after
font-size: clamp(1.2rem, 2.5vw, 2.6rem);
```

The mobile-only override in the `(max-width: 640px)` block (`.body { font-size: 1.8rem; }`) is now redundant since the clamp floor is lower — **remove it** to keep the source of truth in one place.

### 5 — About bio cards: scale on tablet/mobile

`_AboutBio.module.scss` `.cardValue`:

```scss
// before
font-size: 2.6rem;

// after
font-size: clamp(1.6rem, 2.2vw, 2.6rem);
```

Also, the existing `(max-width: 640px)` override that sets `.cardValue { font-size: 2.2rem; }` — **remove**; the clamp handles it.

Add a tablet-specific tightening so the cards don't read oversized between 900 and ~640:

```scss
@media (max-width: 900px) {
  .card {
    padding: 22px;
  }
  .cardValue {
    font-size: clamp(1.6rem, 3.6vw, 2.4rem);
  }
}
```

### 6 — About: "Where I have worked" (1300–900px)

`_Experience.module.scss` `.role` is `clamp(2.8rem, 3.4vw, 4.4rem)`. Reads too large between 1300 and 900. Add:

```scss
@media (max-width: 1300px) and (min-width: 901px) {
  .row {
    grid-template-columns: 130px minmax(0, 1fr) minmax(0, 1fr) 120px;
    gap: clamp(16px, 2vw, 32px);
  }
  .role {
    font-size: clamp(2.4rem, 3vw, 3.6rem);
  }
  .desc {
    font-size: 1.4rem;
  }
}
```

### 7 — Contact: stack form + direct line

`_contactPage.module.scss`:

```scss
.grid {
  display: flex;
  flex-direction: column;
  gap: clamp(40px, 5vw, 80px);
}
// remove the (max-width: 900px) override — no longer needed
```

`app/contact/page.tsx` — swap the order inside `<div className={styles.grid}>` so `<ContactForm>` comes first and `<ContactAside>` (direct lines) second.

### 8 — Contact: form fields read as fields

Goal: keep the calm, paper-on-paper aesthetic but give each input enough visual weight that it's obviously a target. Same `.paper` background everywhere reads as a flat surface — bump fields to a slightly lighter / contrasting fill with a proper border so they pop.

`_ContactForm.module.scss` `.field input, .field textarea`:

```scss
.field input,
.field textarea {
  width: 100%;
  background: var(--bg); // was: transparent
  border: 1px solid var(--rule-strong); // was: 0 + border-bottom
  border-radius: 4px;
  padding: 14px 16px; // was: 12px 0
  font-family: var(--font-body);
  font-size: 1.7rem;
  color: var(--fg);
  resize: vertical;

  @include reduced-motion-safe {
    transition:
      border-color 0.3s,
      background 0.3s;
  }
}

.field input:hover,
.field textarea:hover {
  border-color: var(--fg);
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg);
}

.field textarea {
  min-height: 140px;
  line-height: 1.5;
  padding-top: 14px;
}

.field input[aria-invalid='true'],
.field textarea[aria-invalid='true'] {
  border-color: var(--accent);
}
```

Mobile override (`.field input, .field textarea` inside `(max-width: 640px)`): change to `padding: 12px 14px;` so the new boxed look stays correct on small screens.

### 9 — Contact: subtitle near form header

`ContactForm.tsx` — add a subtitle paragraph inside `.head` (or directly after it). Keep markup tiny and unstyled in TSX; styling lives in the module.

```tsx
<div className={styles.head}>
  <span className={styles.title}>{content.title}</span>
  <button type="button" className={styles.reset} onClick={onReset}>
    {content.reset.label}
  </button>
</div>
<p className={styles.subhead}>
  If a form isn&rsquo;t your thing — message me directly below.
</p>
```

`_ContactForm.module.scss`:

```scss
.subhead {
  font-family: var(--font-body);
  font-size: 1.4rem;
  color: var(--fg-muted);
  margin: -8px 0 8px; // tighten gap to the head
  line-height: 1.4;
  max-width: 44ch;
}
```

Copy lives in the TSX (one-off; no need to bloat `contact-content.ts` for one short line).

### 10 — Footer: 1500–900px + mark top spacing

`_Footer.module.scss` `.mark`:

```scss
.mark {
  // existing styles…
  margin-top: clamp(40px, 6vw, 80px);
}
```

Intermediate band tuning:

```scss
@media (max-width: 1300px) and (min-width: 769px) {
  .top {
    gap: 40px;
    padding-bottom: 56px;
  }
  .cta {
    font-size: clamp(3rem, 4.4vw, 5.2rem);
  }
  .meta {
    font-size: 1.1rem;
  }
  .mark {
    font-size: clamp(9rem, 22vw, 24rem);
    margin-top: clamp(32px, 4vw, 56px);
  }
}
```

The existing `(max-width: 768px)` / `(max-width: 640px)` / `(max-width: 380px)` rules are unaffected.

---

## Accessibility considerations

- **Form field redesign** (item 8): contrast for `--bg` on `--paper` already passes AA at body-text size. Border `--rule-strong` at 1px stays visible. Hover/focus states preserved with stronger color.
- **Form subtitle** (item 9): plain `<p>` between `.head` and the first field. Order matches visual flow — no `aria-*` needed.
- **Page-intro container wrap** (item 3): no semantic change; still a `<header>`.
- **Mobile bio font-size floor of 1.2rem** at root `font-size: 90%` → ~12.24px effective. Acceptable for non-essential body copy at smallest viewports given the line-height; verify against the actual rendered text during the visual pass.

## Edge cases

- **/work index 1500–1100px** — verify with the longest title in the data (Cursimax / Flatwhite). If any title still wraps to two lines and overlaps, drop the title clamp middle term to `4vw`.
- **Contact form on very narrow viewports** — boxed inputs need their `padding` reduced (done in the mobile override) to avoid swallowing all horizontal space. Test at 320px.
- **Footer mark margin** — verify on /about, /contact, /work, all case study pages, and home. The Footer is shared; one margin value covers all.
- **Reduced motion** — no new transitions introduced beyond what's already gated by `@include reduced-motion-safe`.

## Verification

After implementation, in addition to `/ship`:

1. Walk through 320 → 1640px in DevTools on **Home, /work, /about, /contact, one case study** (e.g. /work/cursimax).
2. Confirm Selected Work + Services no longer feel squeezed between 1300–900.
3. Confirm /work index rows do not overlap anywhere from 1500–900.
4. Confirm About + Contact page-intro titles have proper gutter.
5. Tab through Contact form to confirm focus rings still read on the new boxed inputs.
6. Confirm footer mark has clear top spacing on every page.

## Out of scope (defer to `futureWorks.md` if hit)

- Any motion / animation polish.
- Any content rewrites beyond the one Contact form subtitle.
- Any cross-page rhythm work outside of the breakpoints in this spec.
