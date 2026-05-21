# Future works

Real gaps and known-deferred work only — not session notes, not "verify X works" reminders for things that already work, not subjective preferences. If a line wouldn't change the site if left undone, it doesn't belong here.

Format: `- [<area>] <description> — <branch or session ref>`

---

## Open

- [deps] `npm install` reports 2 moderate vulnerabilities. Audit and decide whether to update transitives once the project is stable. — `chore/nextjs-scaffold` session 2026-05-21
- [scaffold] Add a real favicon — currently no `app/icon.{png,svg,ico}`. — `chore/nextjs-scaffold` session 2026-05-21
- [tokens] Verify the 320px clamp-down for `.display-xl` and `.page-intro__title` (`clamp(2.6rem, 10vw, 5.2rem)`) on a real first-gen iPhone SE viewport once the hero ships in Phase 4. — `feature/design-tokens` session 2026-05-21

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)
