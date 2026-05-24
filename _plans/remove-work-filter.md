# Remove /work page filter — combined plan + spec

## Why

There are six projects on `/work`. A filter UI built for a handful of items is overkill — it adds visual chrome, a client-island, and dead categories on the data model. The chip strip read as feature filler. Removing it simplifies the page to "here is the work, in order" — which is the whole point of the index.

## What goes

- The chip strip + "06 projects" counter at the top of `/work`.
- `app/work/_components/Filters/Filters.tsx` (presentational chip strip).
- `app/work/_components/Filters/WorkIndexClient.tsx` (the client island that holds filter state).
- `app/work/_components/Filters/_Filters.module.scss` (filter chrome + the `.index` list styling, which moves to the page module).
- The `Filters/` folder itself.
- `workFilters` array + `WorkFilterValue` type export in `app/_lib/work-projects.ts`.
- `categories: readonly WorkCategory[]` field on every project entry in `app/_lib/work-projects.ts`.
- `WorkCategory` type + the `categories` field on `WorkProject` in `app/_types/work.ts`.

## What stays

- The data in `workProjects` itself (six entries, untouched besides dropping `categories`).
- `IndexRow` component and its styles — projects still render in an ordered list.
- The confidentiality note below the list.
- The `featured` and `order` fields (used by home page Selected Work + ordering).

## What `/work` becomes

`page.tsx` becomes a pure server component that renders the project list directly:

```tsx
<section className={styles.indexSection}>
  <Container>
    <ol className={styles.index} role="list">
      {workProjects.map((project) => (
        <IndexRow key={project.slug} project={project} />
      ))}
    </ol>
    <p className={styles.confidentiality}>…</p>
  </Container>
</section>
```

No `'use client'`, no useState, no filter state, no count.

## Files touched

1. `app/work/page.tsx` — drop `WorkIndexClient` import + render, replace with inline `<ol>` of `IndexRow`s.
2. `app/work/_workPage.module.scss` — add a small `.index` rule (`list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column;`) — same five lines that used to live in `_Filters.module.scss`.
3. `app/work/_components/Filters/Filters.tsx` — delete.
4. `app/work/_components/Filters/WorkIndexClient.tsx` — delete.
5. `app/work/_components/Filters/_Filters.module.scss` — delete.
6. `app/_lib/work-projects.ts` — remove `workFilters` const, `WorkFilterValue` type, and the `categories` field from every entry.
7. `app/_types/work.ts` — remove `WorkCategory` type and the `categories` field on `WorkProject`.

The empty `Filters/` folder also goes.

## Risks / edge cases

- **Server vs client** — `page.tsx` is currently server-rendered; the filter island was the only client surface on `/work`. Removing it means the page is fully static-prerendered with no JS island. Net win for performance.
- **Type imports elsewhere** — `WorkCategory` was used only on the WorkProject `categories` field and inside `workFilters`. Once both go, the type has no other consumers (verified via grep on this exploration pass).
- **`workFilters` import surface** — only `page.tsx` and the filter components import it. After deletes, nothing references it.
- **The "06 projects" counter** — dropped along with the filter strip. It read as "N visible after filter"; with no filter, the number is trivia next to the list itself. If wanted later, can be added as a standalone tagline in two lines.

## Verification

1. `npx tsc --noEmit` clean.
2. `npm run lint` clean.
3. `npm run build` clean — `/work` should still appear as a static route.
4. `npm run dev`, hit `/` (Selected Work strip — should be untouched) and `/work` (no filter strip, no count, just the list).

## Workflow

Branch `chore/remove-work-filter` cut from the tip of `chore/avsb-content-update` (stacked PR — the two are independent but the second is easier to apply on top of the first). One commit, no per-file splits — the deletion is a single conceptual change.
