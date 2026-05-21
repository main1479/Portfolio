# Accessibility

Auto-loaded for every task. A portfolio that fails accessibility undermines the credibility of the developer it's selling — treat this as non-negotiable.

## Always

- **Semantic HTML first.** `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<article>`, `<section>` where they apply.
- **Every image has alt text.** Meaningful content → describe it. Purely decorative → `alt=""` (empty, not missing).
- **Keyboard navigation works.** Tab through every interactive element. No keyboard traps. Focus order matches visual order.
- **Visible focus state** designed deliberately. Don't just remove the browser default ring — replace it with something on-brand.
- **Color contrast meets WCAG AA**: 4.5:1 for body text, 3:1 for large text (18pt+/14pt+ bold) and UI component boundaries.
- **Form fields have labels.** Visible label by default. `aria-label` only when a visible label genuinely doesn't fit the design.
- **Heading order doesn't skip levels.** One `<h1>` per page. `<h2>` follows `<h1>`, `<h3>` follows `<h2>`. Use CSS for visual sizing, not heading level.
- **Link text is meaningful out of context.** Not "click here" or "read more" — say what the link goes to.
- **All interactive elements have a name.** Icon-only buttons need `aria-label`. Logo links to home should say so (`aria-label="Home"` or visually-hidden text).

## Forms (contact form)

- Every input has an associated `<label>` (using `htmlFor` / `id`).
- Errors are announced via `aria-describedby` pointing to an error region.
- Required fields are marked both visually and with `aria-required` or `required`.
- Don't disable the submit button until valid — show the error on submit attempt. Disabled buttons hide the problem.
- Validation errors include the field name in the text ("Enter your email address" not "Required").

## Motion

- Respect `prefers-reduced-motion`. Wrap non-essential transitions/animations in `@media (prefers-reduced-motion: no-preference)`.
- No parallax or auto-playing motion that lasts longer than 5 seconds without a pause control.

## Touch targets

- Interactive elements at least 44×44 CSS pixels (Apple) or 48×48 (Material). Stretch the hit target with padding if the visual is smaller.
- Adequate spacing between adjacent tap targets (at least 8px).

## ARIA

- ARIA is a last resort. The first rule of ARIA is don't use ARIA.
- If a native element does the job (`<button>`, `<details>`, `<dialog>`), use it.
- Never use `role="button"` on a `<div>`. Just use `<button>`.

## Testing

- Tab through every interactive element on every page before saying "done".
- Use the browser's built-in contrast checker (DevTools → Accessibility) on text against its background.
- Periodically run a Lighthouse accessibility audit (`npm run dev` then DevTools → Lighthouse → Accessibility). Aim for 100.
- For pages with forms or complex interaction, do at least one screen-reader pass (VoiceOver on Mac: Cmd+F5).

## Specific portfolio pitfalls

- **Hero text over images.** Either use a solid overlay, or a darkened gradient that gives the text enough contrast at all viewport sizes.
- **Animated typing/scrolling text.** Don't. Or, if you must, freeze it for users with `prefers-reduced-motion: reduce`.
- **Case study screenshots with text-in-image.** Always include a written summary nearby — screen readers can't read the image, and the text rarely scales gracefully on small screens.
- **Dark-mode color palettes.** Verify contrast in both modes, not just light.
