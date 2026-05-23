# Future works

Real gaps and known-deferred work only — not session notes, not "verify X works" reminders for things that already work, not subjective preferences. If a line wouldn't change the site if left undone, it doesn't belong here.

Format: `- [<area>] <description> — <branch or session ref>`

---

## Open

- [deps] `npm install` reports 2 moderate vulnerabilities. Audit and decide whether to update transitives once the project is stable. — `chore/nextjs-scaffold` session 2026-05-21
- [scaffold] Add a real favicon — currently no `app/icon.{png,svg,ico}`. — `chore/nextjs-scaffold` session 2026-05-21
- [tokens] Verify the 320px clamp-down for `.display-xl` and `.page-intro__title` (`clamp(2.6rem, 10vw, 5.2rem)`) on a real first-gen iPhone SE viewport once the hero ships in Phase 4. — `feature/design-tokens` session 2026-05-21
- [build] `next.config.ts` `sassOptions.additionalData` callback is not being applied to component `*.module.scss` under Next 16.2.6 / Turbopack. Phase 3 worked around it with explicit `@use 'mixins' as *;` per component module (contradicts CLAUDE.md line 152 and `.claude/rules/coding-style.md`). Investigate whether to migrate to `prependData`, switch off Turbopack, or accept the per-file `@use` and update the rules. — `feature/layout-shell` session 2026-05-22
- [perf] Pre-hydration accent application: persisted accent currently applies inside `HomeShell`'s mount effect, after first paint. The page loader masks the flash for now; a small inline `<script>` in `<head>` that reads `localStorage[mn-accent-v2]` and sets `--accent` before paint would remove the flash entirely. Track as a Phase 7 polish. — `feature/home-page` session 2026-05-22
- [analytics] Hero variant toggle telemetry (masterplan future ideas §849) — not wired this phase. — `feature/home-page` session 2026-05-22
- [contact] No rate-limiting on `/api/contact`. Revisit after a month if spam appears — add an Upstash single-IP-per-minute counter (or in-memory map) in a follow-up. — `feature/about-and-contact` session 2026-05-22
- [contact] HTML email templates landed in this phase (`app/_lib/email-templates/{notification,confirmation}.ts`). Outstanding email polish: render in real clients (Gmail, Outlook, Apple Mail, Superhuman, mobile Gmail) and tweak any rendering quirks; consider a one-pixel preheader / tracking-pixel removal if the dashboard adds them by default. — `feature/about-and-contact` session 2026-05-22
- [assets] `public/me.jpg` (self-hosted portrait, ≥1024×1024) not yet supplied. About page falls back to the striped diagonal background until a real source is dropped in. — `feature/about-and-contact` session 2026-05-22
- [assets] `/cv.pdf` self-hosting deferred to Phase 7. Three call sites point at the Google Drive URL via `siteConfig.metaLinks` — swap to `/cv.pdf` when the PDF lands. — `feature/about-and-contact` session 2026-05-22
- [a11y] About portrait has no JS-driven `onError` swap if `/me.jpg` 404s. `next/image` will render the broken-image alt instead; the striped diagonal background sits behind it as a visual fallback. — `feature/about-and-contact` session 2026-05-22
- [assets] Real case-study screenshots (AvsB dashboard, Kemon Doctor mobile flows) — striped-fill placeholders in `<CaseVisuals>` ship in Phase 6; replace once real screenshots are available. — `feature/work-and-cases` session 2026-05-23
- [content] Anchor sub-sections on `/work/client` for the three stub rows (Flatwhite, Crypto Gods, Pascal). Currently all three link to plain `/work/client` — promote to `#flatwhite`/`#crypto-gods`/`#pascal` once the Client case copy grows sub-section anchors. — `feature/work-and-cases` session 2026-05-23

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)

- [routes] `SelectedWork` rows on `/` link to `/work/avsb`, `/work/kemon-doctor`, `/work/client`. Resolved — all three case routes ship in Phase 6. — `feature/work-and-cases` 2026-05-23
