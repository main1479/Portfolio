# Future works

Running list of deferred work, preexisting issues uncovered, and knowingly-partial behaviour. One line per item.

Format: `- [<area>] <description> — <branch or session ref>`

Examples (delete once real entries appear):

- [setup] Choose between Resend and Formspree for the contact form — `chore/scaffold` session 2026-05-21
- [a11y] Hero image needs a darker overlay at mobile breakpoints — `feature/hero` session 2026-05-21

---

## Open

- [hooks] Verify `auto-format.sh` actually formats on Edit/Write once Prettier is installed in the project (Phase 1 of nextjs-scaffold). — `chore/claude-config-cleanup` session 2026-05-21
- [hooks] Confirm `secret-scan-write.js` blocks a fake `sk_live_...` constant once the project has a real `.tsx` file to test against. — `chore/claude-config-cleanup` session 2026-05-21
- [hooks] Decide whether the `Notification` hook matcher should be tightened (currently fires on every notification with the Submarine sound). Defer to user preference after a few sessions of real use. — `chore/claude-config-cleanup` session 2026-05-21
- [commands] End-to-end test `/finish-feature` on the first real feature merge after `chore/repo-init` lands — verify branch detection, plan/spec move, PR open, squash-merge, branch cleanup, and main sync all work as designed. — `chore/finish-feature-command` session 2026-05-21
- [config] Verify the project-scope allow/deny lists in `.claude/settings.json` actually suppress permission prompts (no auto-recorder additions to `settings.local.json`) once the repo is in steady use. Re-evaluate after a real feature cycle. — `chore/claude-config-cleanup` session 2026-05-21
- [bootstrap] First feature merge (`chore/nextjs-scaffold`) is the real end-to-end test for `/finish-feature`. Verify all 9 steps run cleanly there before declaring the workflow stable. — `chore/repo-init` session 2026-05-21
- [hooks] After the bootstrap commit lands, restart Claude Code so `.claude/settings.json` (hooks + permissions) actually loads — they weren't active in the bootstrap session because the file was created mid-session. — `chore/repo-init` session 2026-05-21

## Resolved

(move items here once they're addressed, with the commit or PR that resolved them)
