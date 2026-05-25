# Display tier on ultrawide — plan + spec

A focused SCSS-only tweak. The site's biggest display-tier headings (`.display-xl`, `.page-intro__title`, and the End-CTA heading) cap at 26–27rem (260–270px) once viewport width hits ~1500px. On a normal 1080p / 1440p desktop this looks confident; on a 2560px+ ultrawide it just looks oversized — the type sits in the middle of a much wider canvas and reads as shouting.

## Approach

One change per selector: lower the clamp `max` to `14rem` (140px) and drop the `vw` rate from `17vw`/`16vw` to `8vw`. That's it — no ultrawide `@media` override.

The point of `clamp()` is to express the cap-min-rate trio in one rule. If the cap is set to what we want on ultrawide, the clamp alone handles ultrawide too. Stacking an `@media (min-width: ...)` font-size on top of a clamp is contradictory — pick one or the other.

## Files touched

| File                                                 | Selector             | Old                          | New                       |
| ---------------------------------------------------- | -------------------- | ---------------------------- | ------------------------- |
| `app/_styles/_typography.scss:36`                    | `.display-xl`        | `clamp(8.4rem, 17vw, 27rem)` | `clamp(4rem, 8vw, 14rem)` |
| `app/_styles/globals.scss:108`                       | `.page-intro__title` | `clamp(8.4rem, 17vw, 26rem)` | `clamp(4rem, 8vw, 14rem)` |
| `app/_components/home/EndCTA/_EndCTA.module.scss:13` | End-CTA heading      | `clamp(8rem, 16vw, 26rem)`   | `clamp(4rem, 8vw, 14rem)` |

## What that gives you across viewport widths

With `clamp(4rem, 8vw, 14rem)` the heading is:

- ≤500px viewport: `4rem` (40px, the floor)
- 500–1750px: scales fluidly with `8vw` (40px → 140px)
- ≥1750px: capped at `14rem` (140px) — same on FullHD, 1440p, 2560p ultrawide, 4K

So 1080p, 1440p, 1800p, and ultrawide all show the same 140px heading — exactly what "standard size even on ultrawide" asked for.

## Scope and non-scope

- **In scope:** the three selectors above.
- **Out of scope:** all the smaller display-tier rules — `.display-lg` (17rem max), `.display-md` (11rem), `.case-hero__title` (17rem), `.loader` wordmark (14rem), `.stats` (14rem). They cap small enough to be fine on any viewport.
- **Mobile `@media` overrides for these three are not touched** — they're tuned for specific narrow widths and don't conflict with the new desktop default.
- **Footer `.mark` not touched** — its giant variant only applies in `@media (max-width: 1300px) and (min-width: 769px)`. The default above 1300px is already capped at 10rem.

## Risk

- There is a discontinuity at exactly 1100px viewport (where the existing `@media (max-width: 1100px)` rule kicks in with `clamp(5.6rem, 12vw, 14rem)` — 132px at 1100px). Above 1100px with the new default, 8vw gives only ~88px at 1101px viewport. That's a ~44px drop when resizing across 1100px. If it's visible/annoying, the 1100px `@media` for `.display-xl` and `.page-intro__title` can also be lowered to match `8vw`, or removed entirely. Deferred until flagged.

## Branch + process

- Branch: `fix/display-tier-ultrawide` (off `main`).
- One implementation commit (mechanical edits across 3 files).
- `/ship` (typecheck + lint + build) before PR.
- Human-eyeball pass owed on ultrawide + 1080p + 1440p + 900px.
