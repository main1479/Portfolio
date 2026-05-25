# Remove homepage Intro section — plan + spec

Drop the Intro section from `/` entirely. After the recent dedup pass on copy, it was doing the same job as the About page (positioning + how-I-work narrative) without adding anything the rest of the home didn't already say (Hero, Marquee, Stats). Cutting it removes the duplication and shortens the scroll from Hero → case studies.

## Why

The Intro currently sits between Marquee and Stats and repeats: "I'm a frontend developer since 2019", "frontend you can measure", "500+ A/B tests", and the Claude Code workflow paragraph — all of which now live properly on About. The user reviewed three replacement copy options and chose option C: remove the section.

## Files touched

**Removing the section itself:**

- `app/page.tsx` — drop the `Intro` import and the `<Section><Container><Intro /></Container></Section>` block.
- `app/_lib/home-content.ts` — delete the `intro` field.
- `app/_types/home.ts` — delete the `intro` field from `HomeContent`.
- `app/_components/home/Intro/Intro.tsx` — deleted.
- `app/_components/home/Intro/_Intro.module.scss` — deleted.

**Salvage step (helper relocation):**

`Intro.tsx` also exports a `renderSegments(segments)` helper that `SelectedClients` and `Recognition` both import to render rich-text content (text / strong / accent kinds). It has to move before the Intro folder can be deleted.

- New: `app/_components/home/Segments/Segments.tsx` — the helper, unchanged behaviour.
- New: `app/_components/home/Segments/_Segments.module.scss` — owns the `.accent` style the helper applies.
- `app/_components/home/SelectedClients/SelectedClients.tsx` — import path from `../Intro/Intro` → `../Segments/Segments`.
- `app/_components/home/Recognition/Recognition.tsx` — same import path swap.

## Non-scope

- The `IntroSegment` type name in `_types/home.ts` is now slightly misleading (it's used by `selectedClients.intro` and `recognition.lede` data, both `ReadonlyArray<IntroSegment>`). Renaming to `RichTextSegment` would be cleaner but is a follow-up if it ever bugs anyone — kept here to minimise churn.

## Branch + process

- Branch: `chore/remove-home-intro` (off `main`).
- Single implementation commit (relocation + deletion + render-removal land together — splitting wouldn't compile).
- `/ship` (typecheck + lint + build) before PR.
- Visual check needed: the home page should now scroll Hero → Marquee → Stats → Services with no gap.
