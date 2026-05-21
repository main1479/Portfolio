# Plan + Spec — `/finish-feature` slash command

> Combined plan and spec per `CLAUDE.md:91` — single-file addition, non-trivial behavior but bounded.

**Status:** Implemented (pending move to `_plans/done/` via `/finish-feature` once repo is `git init`'d)
**Date:** 2026-05-21
**Branch (when created):** `chore/finish-feature-command`

---

## What

A new slash command — `/finish-feature` — that wraps the end-of-feature ceremony:

1. **Verify** the working tree is shippable (run `/ship`-equivalent checks).
2. **Move** the matching `_plans/<feature>-plan.md` and `_specs/<feature>-spec.md` into `_plans/done/` and `_specs/done/` via `git mv`, committed on the feature branch.
3. **Open** a PR to `main` (or update an existing one) with title + body derived from the plan.
4. **Pause** for explicit user confirmation before merging — merging to `main` is irreversible.
5. **Squash-merge** via `gh pr merge --squash --delete-branch`.
6. **Sync local** — checkout `main`, pull.
7. **Prompt** for any `futureWorks.md` additions.

## Why

The workflow in `CLAUDE.md` prescribes 11 steps per feature. The first 9 (plan, spec, approve, branch, implement, commit, verify, push, summary) happen naturally as you code. The last 2 (move-to-done + merge + cleanup) are mechanical and easy to skip when momentum drops. A single command captures the discipline so it can't drift.

## Terminology — clarify in passing

You asked for a "hook"; what fits the requirement is a slash command (user-triggered). Claude Code hooks are event-triggered (PreToolUse, PostToolUse, Notification, SessionStart, etc.) and there's no natural event for "I just shipped a feature." The behavior is identical; only the harness slot differs.

## Decisions I'm making (override these in the comment below)

| Decision                               | Default                 | Why                                                                                                                                                                                                    |
| -------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auto-merge vs confirm before merge** | **Confirm**             | Merging to main is irreversible. Even on a solo project, one accidental `gh pr merge` on the wrong branch is enough to want a checkpoint. The confirmation is just "type y" so the friction is minimal |
| **Pre-flight `/ship` gauntlet**        | **Required, blocking**  | If typecheck/lint/build fails, refuse to merge. Cheap safety                                                                                                                                           |
| **Merge strategy**                     | **Squash**              | `CLAUDE.md:170` / `git-workflow.md:39` already say squash by default                                                                                                                                   |
| **Delete branch**                      | **Yes, local + remote** | `git-workflow.md:40`. Keeps branch list tidy                                                                                                                                                           |
| **Wait for CI checks**                 | **Skip**                | `CLAUDE.md:245` — no CI yet. Add back when CI exists                                                                                                                                                   |
| **Behavior if plan/spec missing**      | **Warn + ask**          | Hotfixes may legitimately have no plan/spec. Don't refuse to ship over docs that were never written                                                                                                    |
| **Behavior on dirty working tree**     | **Refuse**              | Don't auto-commit unrelated changes                                                                                                                                                                    |
| **Behavior on `main` branch**          | **Refuse**              | `/finish-feature` is for feature branches; nothing to merge from main                                                                                                                                  |
| **Run sub-agents**                     | **No**                  | `/ship` already covers correctness gates; running `code-reviewer` here would be redundant with the per-commit review the workflow expects                                                              |

## File changes

| File                                 | Action                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `.claude/commands/finish-feature.md` | **Create** — slash command prompt (~80 lines)                                            |
| `CLAUDE.md`                          | **Edit** — add `/finish-feature` to the slash-commands list at line 206–208              |
| `futureWorks.md`                     | **Append** — entry noting end-to-end verification deferred until `chore/repo-init` lands |

## Slash command structure (`.claude/commands/finish-feature.md`)

The file is a prompt that drives Claude through the ceremony. Sketch of contents:

```
---
description: Wrap up a feature — move plan/spec to done, open PR, squash-merge to main, sync local, delete branch.
---

# /finish-feature [feature-name]

## Step 0 — Resolve feature name
- If argument provided, use it
- Else parse current branch: `feature/case-study-shell` → `case-study-shell`
- Else fail with explicit error

## Step 1 — Refuse if not safe to proceed
- Refuse if current branch is `main` or `master`
- Refuse if working tree is dirty (`git status --porcelain` non-empty)
- Refuse if branch has no upstream / never pushed

## Step 2 — Run /ship gauntlet (blocking)
- `npm run typecheck && npm run lint && npm run build`
- Report failures verbatim; stop on first failure

## Step 3 — Move plan and spec to done/
- Verify `_plans/<feature>-plan.md` and `_specs/<feature>-spec.md` exist
- If either missing: warn and ASK before continuing
- `mkdir -p _plans/done _specs/done`
- `git mv _plans/<feature>-plan.md _plans/done/`
- `git mv _specs/<feature>-spec.md _specs/done/`
- `git commit -m "chore: move <feature> plan/spec to done"`
- `git push`

## Step 4 — Ensure PR exists
- Check via `gh pr view --json number,state,mergeable`
- If none, open: `gh pr create --base main --head <branch>`
  - Title: from plan's first H1 (or "feat: <feature-name>")
  - Body: short summary pulled from plan, plus link to spec
- If exists, refresh metadata

## Step 5 — PAUSE for confirmation
Print:
  PR: #<n> — <title>
  Branch: <branch> → main
  Strategy: squash + delete branch
Ask user: "Ready to merge? Type 'y' to proceed."
DO NOT merge without explicit y.

## Step 6 — Squash-merge
- `gh pr merge <PR> --squash --delete-branch`
- Report result

## Step 7 — Sync local main
- `git checkout main`
- `git pull origin main`

## Step 8 — Prompt for futureWorks.md
- Ask: "Anything outstanding from this feature? (one-liners for futureWorks.md)"
- If user provides items, append them under "## Open"
- Commit on main as `chore: log <feature> outstanding items` and push

## On failure
Any step failing leaves the user on the feature branch with no merge done. Print the failing step and the recovery action.
```

## Verification

End-to-end test requires:

- A real git repo (defer until `chore/repo-init`)
- An open PR with a feature branch (defer until first real feature ships)

What I can verify now:

- Slash command file is valid markdown with required frontmatter
- The command reads as a clear procedure if a fresh Claude session loaded it
- No syntax errors in any of the embedded shell commands (`gh`, `git`, `npm` — dry-run via `bash -n` won't help here because the commands are inside a markdown prompt, not a shell script)

Mark a `futureWorks.md` entry to do an end-to-end test on the **first real feature merge** after `chore/repo-init` lands.

## Edge cases worth designing for

- **Multiple plans/specs** matching the feature name (e.g., user re-ran a plan). Use the one whose filename matches the branch most strictly; if ambiguous, list and ask.
- **PR has merge conflicts.** `gh pr merge` will fail; surface the error and tell the user to rebase.
- **CI checks failing** (when CI exists). Skip for now; add `--required` gate to `gh pr merge` later.
- **Branch not pushed.** Push it as part of Step 1 verification rather than refusing? Decision: push it, then proceed (it's annoying to abort over something fixable in one command).
- **User on `main` and the feature branch was already merged.** Detect via `gh pr list --state merged`; if found, just clean up local branch and exit.

## Risk

Low. The risky step (merge to main) is gated on explicit user confirmation. Everything else is reversible — moving files can be undone via `git mv` back, and the chore-commits are squashed into the merge.

## Out of scope

- Rollback. If merge succeeds and the user wants to revert, that's a separate command (`/revert-feature` perhaps, later).
- Notifications (Slack, email). Not needed for a solo project.
- Auto-update of a `CHANGELOG.md`. The repo doesn't have one; if it grows one later, that's a `futureWorks.md` follow-up.

---

## Retrospective

### What the plan got right

- Combining plan + spec into one note via the `CLAUDE.md:91` escape hatch was the right call — the change is one file in `.claude/commands/` and the design is self-documenting in the file's own prose.
- The "pause before merge" gate is captured in the command file as a hard sentence Claude can't easily skip: line 81 reads `**Do not call \`gh pr merge\` until the user replies with \`y\`, \`yes\`, or equivalent.\*\*` Bold + explicit.
- The decision table (auto-merge vs confirm, ship as gate, etc.) front-loaded the contentious choices so review took one read.

### What the plan got wrong

- Nothing material. The command file came in at 132 lines (sketch estimated ~80) — the difference is the failure-recovery prose at the bottom, which felt worth keeping. If it bloats further on real use, prune.

### What was deferred

- End-to-end test of the command. Logged to `futureWorks.md` to verify on the first real feature merge after `chore/repo-init`.
- No CI gate on the PR merge — `CLAUDE.md` says no CI yet. Worth revisiting when CI exists.
