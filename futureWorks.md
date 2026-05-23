# Future works

Real gaps and known-deferred work only — not session notes, not "verify X works" reminders for things that already work, not subjective preferences. If a line wouldn't change the site if left undone, it doesn't belong here.

Format: `- [<area>] <description> — <branch or session ref>`

---

## Open

- [tokens] Verify the 320px clamp-down for `.display-xl` and `.page-intro__title` (`clamp(2.6rem, 10vw, 5.2rem)`) on a real first-gen iPhone SE viewport once the hero ships in Phase 4. — `feature/design-tokens` session 2026-05-21
- [build] `next.config.ts` `sassOptions.additionalData` callback is not being applied to component `*.module.scss` under Next 16.2.6 / Turbopack. Phase 3 worked around it with explicit `@use 'mixins' as *;` per component module (contradicts CLAUDE.md line 152 and `.claude/rules/coding-style.md`). Investigate whether to migrate to `prependData`, switch off Turbopack, or accept the per-file `@use` and update the rules. — `feature/layout-shell` session 2026-05-22
- [analytics] Hero variant toggle telemetry (masterplan future ideas §849) — not wired this phase. — `feature/home-page` session 2026-05-22
- [contact] No rate-limiting on `/api/contact`. Revisit after a month if spam appears — add an Upstash single-IP-per-minute counter (or in-memory map) in a follow-up. — `feature/about-and-contact` session 2026-05-22
- [contact] HTML email templates landed in this phase (`app/_lib/email-templates/{notification,confirmation}.ts`). Outstanding email polish: render in real clients (Gmail, Outlook, Apple Mail, Superhuman, mobile Gmail) and tweak any rendering quirks; consider a one-pixel preheader / tracking-pixel removal if the dashboard adds them by default. — `feature/about-and-contact` session 2026-05-22
- [assets] `public/me.jpg` (self-hosted portrait, ≥1024×1024) not yet supplied. About page falls back to the striped diagonal background until a real source is dropped in. — `feature/about-and-contact` session 2026-05-22
- [a11y] About portrait has no JS-driven `onError` swap if `/me.jpg` 404s. `next/image` will render the broken-image alt instead; the striped diagonal background sits behind it as a visual fallback. — `feature/about-and-contact` session 2026-05-22
- [assets] Real case-study screenshots (AvsB dashboard, Kemon Doctor mobile flows) — striped-fill placeholders in `<CaseVisuals>` ship in Phase 6; replace once real screenshots are available. — `feature/work-and-cases` session 2026-05-23
- [content] Anchor sub-sections on `/work/client` for the two remaining stub rows (Flatwhite, Pascal). Currently both link to plain `/work/client` — promote to `#flatwhite`/`#pascal` once the Client case copy grows sub-section anchors. — `feature/work-and-cases` session 2026-05-23
- [assets] Real screenshots for `/work/cursimax` — case page ships without a `<CaseVisuals>` block; add 2–3 captured frames (hero, course discovery, mobile) when ready. — `feature/cursimax-and-country-count` session 2026-05-23
- [content] Cursimax case copy is inferred from the live site + repo (no direct brief from the client). Have Mainul refine the Approach / What I built blocks if anything reads off. — `feature/cursimax-and-country-count` session 2026-05-23
- [deps] `npm audit` reports 2 moderate (`postcss <8.5.10`, transitive via `next`). Not exploitable in this build context (PostCSS only stringifies build-time author SCSS). Fix would require downgrading Next to 9.3.3 — breaking change. Tracking Next 16.3 stable for an automatic upstream fix. — `feature/polish-and-launch` session 2026-05-23
- [deploy] DNS for `mainul.info` not configured by Phase 7 PR — Vercel domain binding + apex/CNAME records remain a manual outside-the-repo step. — `feature/polish-and-launch` session 2026-05-23

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)

- [routes] `SelectedWork` rows on `/` link to `/work/avsb`, `/work/kemon-doctor`, `/work/client`. Resolved — all three case routes ship in Phase 6. — `feature/work-and-cases` 2026-05-23
- [scaffold] Add a real favicon — `app/icon.svg` + `app/apple-icon.tsx` ship in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [assets] `/cv.pdf` self-hosting — shipped as `/Resume_Mainul.pdf` in Phase 7. — `feature/polish-and-launch` 2026-05-23
- [deps] `npm install` reports 2 moderate vulnerabilities — documented exception (transitive `postcss <8.5.10` via `next`; no exploit surface in this build). Tracking Next 16.3 stable. See Open entry. — `feature/polish-and-launch` 2026-05-23
- [perf] Pre-hydration accent application — won't-fix; the accent switcher itself is dropped from scope (see masterplan §3.1 amendment). — `feature/polish-and-launch` 2026-05-23
