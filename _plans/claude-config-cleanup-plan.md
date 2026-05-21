# Plan — Claude config cleanup

**Status:** Implemented (pending move to `_plans/done/` via `/finish-feature` once repo is `git init`'d)
**Date:** 2026-05-21
**Branch (when created):** `chore/claude-config-cleanup`

---

## What

Fix a handful of issues in the `.claude/` setup before we start scaffolding Next.js. None of them are about Next.js itself — they're about making sure Claude Code's automation (hooks, permissions) actually works the way the rules in `CLAUDE.md` promise.

## Why

A code review of the `.claude/` folder flagged five issues:

1. **Hooks may not be loading.** They live in a standalone `.claude/hooks.json` file, but Claude Code reads hook configuration from `.claude/settings.json` (or `settings.local.json`) under a `"hooks"` key. Until that move happens, the secret-scan-on-Write block, the auto-format-after-Edit, and the macOS notifications may all be silently dead.

2. **The "block commits to main" hook has a false-positive bug.** It blocks any Bash command containing the word "main" — including commit messages like `git commit -m "fix main nav"`. We rewrite it to check the actual current git branch instead of regex-matching the command string.

3. **`auto-format.sh` silently no-ops on a clean macOS** because it depends on `jq`, which isn't installed by default. We replace the one `jq` call with a tiny inline `node -e "..."` (Node is already a project prerequisite).

4. **`settings.local.json` has stale Astro references** (Next.js is the locked choice now) and is missing the git/gh permissions the new workflow needs. The current allowlist will pop a permission prompt every time we run `git checkout`, `git add`, `git commit`, `git push`, or `gh pr create` — which the prescribed workflow does dozens of times per feature.

5. **A few small polish items**: notification hook with no matcher (fires on everything with the Submarine sound), and a CLAUDE.md phrasing ambiguity about when `@use` is required.

## Why now (not later)

We're about to do many feature cycles. Each cycle pushes plan + spec + multiple implementation commits. If permissions aren't right, we get prompt-storm; if hooks aren't loading, the secret-scan and auto-format don't fire and we drift toward bad habits without realizing it. Fix the harness before we start the work.

## What we're not changing

- The 13 critical rules, the 11-step workflow, the plan/spec scaffolding, the rules/, skills/, agents/, and commands/ contents are all staying as-is.
- The hooks themselves (secret-scan-write.js, auto-format.sh, notify.sh) keep their behavior — we're only fixing where they're registered and the two specific bugs above.

## Out of scope

- Initializing the git repo and creating the GitHub remote — that's its own plan (`chore/repo-init-plan.md`), to be done immediately after this one approves.
- Next.js scaffold — that's `chore/nextjs-init-plan.md`, coming after the repo init.

## Open questions

None. The fixes are mechanical. The spec next door has the exact change list.

## Risk

Low. All changes are in `.claude/` config — no application code is touched. The hook merge is reversible by copying the JSON back out into `.claude/hooks.json` if the new home doesn't work for any reason.
