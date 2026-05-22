# Future works

Real gaps and known-deferred work only — not session notes, not "verify X works" reminders for things that already work, not subjective preferences. If a line wouldn't change the site if left undone, it doesn't belong here.

Format: `- [<area>] <description> — <branch or session ref>`

---

## Open

- [deps] `npm install` reports 2 moderate vulnerabilities. Audit and decide whether to update transitives once the project is stable. — `chore/nextjs-scaffold` session 2026-05-21
- [scaffold] Add a real favicon — currently no `app/icon.{png,svg,ico}`. — `chore/nextjs-scaffold` session 2026-05-21
- [tokens] Verify the 320px clamp-down for `.display-xl` and `.page-intro__title` (`clamp(2.6rem, 10vw, 5.2rem)`) on a real first-gen iPhone SE viewport once the hero ships in Phase 4. — `feature/design-tokens` session 2026-05-21
- [build] `next.config.ts` `sassOptions.additionalData` callback is not being applied to component `*.module.scss` under Next 16.2.6 / Turbopack. Phase 3 worked around it with explicit `@use 'mixins' as *;` per component module (contradicts CLAUDE.md line 152 and `.claude/rules/coding-style.md`). Investigate whether to migrate to `prependData`, switch off Turbopack, or accept the per-file `@use` and update the rules. — `feature/layout-shell` session 2026-05-22
- [routes] `SelectedWork` rows on `/` link to `/work/avsb`, `/work/kemon-doctor`, `/work/client`. These routes don't exist until Phase 6 — clicking returns 404 in the interim. — `feature/home-page` session 2026-05-22
- [perf] Pre-hydration accent application: persisted accent currently applies inside `HomeShell`'s mount effect, after first paint. The page loader masks the flash for now; a small inline `<script>` in `<head>` that reads `localStorage[mn-accent-v2]` and sets `--accent` before paint would remove the flash entirely. Track as a Phase 7 polish. — `feature/home-page` session 2026-05-22
- [analytics] Hero variant toggle telemetry (masterplan future ideas §849) — not wired this phase. — `feature/home-page` session 2026-05-22

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)
