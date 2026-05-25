# Display tier on ultrawide — plan + spec

A focused SCSS-only tweak. The site's biggest display-tier headings (`.display-xl`, `.page-intro__title`, and the End-CTA heading) cap at 26–27rem (260–270px) once viewport width hits ~1500px. On a normal 1080p / 1440p desktop this looks confident; on a 2560px+ ultrawide it just looks oversized — the type sits in the middle of a much wider canvas and reads as shouting.

Lowering the clamp `max` values brings the cap down across all desktops, and an additional `@media (min-width: 1800px)` override pins the display tier to ~16rem on ultrawide.

---

## Files touched

**Lower clamp max:**

| File                                                 | Selector             | Old                          | New                          |
| ---------------------------------------------------- | -------------------- | ---------------------------- | ---------------------------- |
| `app/_styles/_typography.scss:36`                    | `.display-xl`        | `clamp(8.4rem, 17vw, 27rem)` | `clamp(8.4rem, 17vw, 22rem)` |
| `app/_styles/globals.scss:108`                       | `.page-intro__title` | `clamp(8.4rem, 17vw, 26rem)` | `clamp(8.4rem, 17vw, 22rem)` |
| `app/_components/home/EndCTA/_EndCTA.module.scss:13` | End-CTA heading      | `clamp(8rem, 16vw, 26rem)`   | `clamp(8rem, 16vw, 22rem)`   |

**Add ultrawide cap (`@media (min-width: 1800px)`):**

- `.display-xl` → `16rem`
- `.page-intro__title` → `16rem`
- End-CTA heading → `16rem`

**Footer `.mark` left alone** — the giant `clamp(9rem, 22vw, 24rem)` value only applies inside `@media (max-width: 1300px) and (min-width: 769px)`. The base `.mark` rule (above 1300px) is already `clamp(8rem, 8vw, 10rem)` — capped at 10rem, fine on ultrawide.

---

## Scope and non-scope

- **In scope:** the three selectors above. These are the only display-tier rules where the >1300px base style has a max ≥22rem.
- **Out of scope:** `.display-lg` (17rem max), `.display-md` (11rem), `.case-hero__title` (17rem), `.loader` wordmark (14rem), `.stats` (14rem). All cap at sizes that still read as proportionate on ultrawide. Revisit only if the user flags them.
- **No mid-range regression for the smaller display tier.** Only the very biggest tier gets the cap reduction.

## Breakpoint choice

`@media (min-width: 1800px)` targets 1920px+ desktops and ultrawides. The most common desktop (1920×1080) gets the new cap. Laptops at ≤1680px keep the lowered-max clamp behaviour, which is still smaller than today's 24–27rem but allowed to scale with vw.

## Risk

- There's a small visual jump at exactly 1800px when resizing, since 17vw at 1800px = 306px (clamped to 22rem = 220px in the new clamp), then the ultrawide rule drops it to 16rem = 160px. Users don't typically resize across this boundary, so the jump is theoretical. If it becomes annoying, swap the hard cap for a second clamp that lerps between 22rem and 16rem over a viewport range.

## Branch + process

- Branch: `fix/display-tier-ultrawide` (off `main`).
- One implementation commit (mechanical edits across 3 files).
- `/ship` (typecheck + lint + build) before PR.
- Human-eyeball pass owed on ultrawide + 1080p + 1440p + 900px (`futureWorks.md` will note it).
