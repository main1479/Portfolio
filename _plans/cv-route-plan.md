# `/cv` route — print-styled resume page

## Why

The PDF in `public/CV_Mainul.pdf` is ~3 years behind the site — missing AvsB, Kemon Doctor, Radius, AI mentions, the full-time positioning, and the new stack. Rather than maintain two artifacts that drift, build the CV as a route on the site so updates happen in one place: edit the content lib, browse to `/cv`, save the page as PDF.

## What it is

A single new route at `/cv` that:

- Renders a one- or two-page resume in HTML/CSS using the same fonts and accent colour as the rest of the site.
- Looks good on screen (so it's also useful as a link to send) and prints to a clean PDF via the browser's _Save as PDF_.
- Pulls its content from a single source-of-truth file (`app/_lib/cv-content.ts`).
- Hides Nav / Loader / CustomCursor when printing — they're noise on paper.
- Is `noindex/nofollow` so it doesn't compete with the home page in search.

## Content

Mirrors the priority-ranked list from the CV review session:

1. **Header** — name, role tagline ("Frontend Developer · A/B Testing & Experimentation"), 4 contact lines (email, GitHub, LinkedIn, mainul.info), phone.
2. **About** — one paragraph matching the site's positioning. Full-time and contract framing.
3. **Stats** — 7+ yrs frontend · 4+ yrs experimentation · 500+ A/B tests · 9+ countries.
4. **Experience** — Conversion.com 2022-2026 (wound down), Freelance 2019-Present.
5. **Featured projects** — AvsB, Kemon Doctor, Radius (one block each, with the case page URL).
6. **Selected client work** — Cursimax, Flatwhite, Lenoir, ScalingLab, Azzeroco, Life Vest (one line each).
7. **Skills** — six groups matching about page including the new "AI as co-engineer".
8. **Awards** — BestCSS.in Site of the Day (Dec 2021), Design Nominees Site of the Day (Nov 2021).
9. **Links footer** — Portfolio · GitHub · LinkedIn.

Practice GitHub projects from the old CV are intentionally dropped. The Template Developer 3-month stint is dropped. CSS REELS is dropped unless re-confirmed.

## Design

- Single column, A4 proportions (≈ 210mm × 297mm).
- Display font (Teko) for the name. Body font (Josefin Sans) for paragraphs. Mono (JetBrains) for labels.
- Accent colour (`--accent` / `#1f3a5f`) on labels and key emphasis. Black ink for body.
- Section labels use the same mono-uppercase style as the site's mono labels.
- Tag groups for skills use the same `+ ITEM` pattern the about page now uses.

## Print considerations

- `@media print` rules in `_cvPage.module.scss`.
- `@page { size: A4; margin: 12mm; }`.
- Forces white background / black text in print (drops the `--bg` paper tone).
- `page-break-inside: avoid` on each experience entry, project block, and skill group so sections don't split awkwardly.
- Nav, CustomCursor, Loader, and the on-page "Save as PDF" button get `display: none` in print.

## Files

- `app/cv/page.tsx` — the route. Server component. Reads from `cv-content.ts`.
- `app/cv/_cvPage.module.scss` — page styles, including print rules.
- `app/cv/_components/CvDocument/CvDocument.tsx` — the document body (header, sections).
- `app/cv/_components/PrintButton/PrintButton.tsx` — screen-only client component for `window.print()`.
- `app/_lib/cv-content.ts` — content data.
- `app/_types/cv.ts` — content type (optional, keep simple).
- `app/robots.ts` — add `/cv` to disallow.
- `app/_components/Nav/Nav.tsx` — already hidden on print via global @media print rule added to globals.scss.

## What I'm NOT doing

- Not replacing the existing `CV_Mainul.pdf` automatically — the user will save the new page to PDF themselves once they're happy with the rendering and drop it in.
- Not adding a route group with a separate root layout — keeping the site's global Nav on screen at `/cv` is useful (visitors can navigate). Print CSS does the hiding work.
- Not adding a CSS-paged-media polyfill or PDF-generation library — browser's native Save as PDF is enough.

## Branch + workflow

Staying on `feature/copy-overhaul`. The CV update is a direct consequence of the copy work and benefits from the same branch + PR. The user can split commits at squash-merge time if they prefer.

Plan + spec combined into this single note (per the trivial-changes clause), since scope is well-defined and direction is pre-approved.
