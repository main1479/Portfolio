---
description: Wrap up a feature — move plan/spec to done, run /ship gauntlet, open PR, pause for confirmation, squash-merge to main, delete branch, sync local. Pauses before the merge — merging to main is irreversible.
---

# /finish-feature

End-of-feature ceremony. Walk the user through each step in order. **Stop on any failure** — leave the user on the feature branch in a recoverable state.

## Step 0 — Resolve the feature name

1. If the user provided an argument, use it as `<feature>`.
2. Else read the current branch (`git branch --show-current`). Strip the type prefix to get `<feature>`:
   - `feature/case-study-shell` → `case-study-shell`
   - `fix/contact-form-validation` → `contact-form-validation`
   - `chore/upgrade-next` → `upgrade-next`
3. Else fail with: "No branch and no argument — pass the feature name explicitly: `/finish-feature <name>`".

## Step 1 — Refuse if not safe to proceed

Check each guard. If any fails, **stop** and print why.

- Current branch is **not** `main` or `master`.
- Working tree is clean (`git status --porcelain` produces no output).
- Branch has an upstream (`git rev-parse --abbrev-ref --symbolic-full-name @{u}` succeeds). If not, push it: `git push -u origin <branch>` and continue.
- A GitHub remote exists (`gh repo view` succeeds).

## Step 2 — Run the `/ship` gauntlet (blocking)

Run in sequence, stop on first failure:

```bash
npm run typecheck
npm run lint
npm run build
```

If any step fails, print its stderr verbatim and stop. Do not move plan/spec, do not merge.

If any script doesn't exist yet (the Next.js project may not be fully wired), note it and skip — but require **at minimum** `npm run build` to pass once it exists.

## Step 3 — Move plan and spec to `done/`

1. Check for `_plans/<feature>-plan.md` and `_specs/<feature>-spec.md`.
2. If **either** is missing, print which and ask the user: "No plan/spec found for `<feature>`. Continue without moving docs? [y/N]". If they say no, stop.
3. Create the `done/` dirs if needed: `mkdir -p _plans/done _specs/done`.
4. Move with `git mv`:
   ```bash
   git mv _plans/<feature>-plan.md _plans/done/
   git mv _specs/<feature>-spec.md _specs/done/
   ```
5. Commit and push:
   ```bash
   git commit -m "chore: move <feature> plan/spec to done"
   git push
   ```

## Step 4 — Ensure a PR exists

1. Check for an open PR from this branch: `gh pr view --json number,state,title,url`.
2. If none, open one:

   ```bash
   gh pr create --base main --head <branch> --title "<title>" --body "<body>"
   ```

   - **Title**: read the first `#` heading from `_plans/done/<feature>-plan.md`. If it starts with "Plan — ", strip that prefix. Fall back to `feat: <feature>` if no plan exists.
   - **Body**: summary lifted from the plan's `## What` section, followed by `\n\nSpec: _specs/done/<feature>-spec.md`.

3. Record the PR number and URL for the next step.

## Step 5 — PAUSE for explicit confirmation

This is the hard gate. Print exactly:

```
PR: #<n> — <title>
URL: <url>
Branch: <branch> → main
Strategy: squash + delete branch (local + remote)

Ready to merge? Type 'y' to proceed.
```

**Do not call `gh pr merge` until the user replies with `y`, `yes`, or equivalent.** If they say anything else, stop and ask again or abort the command.

## Step 6 — Squash-merge

```bash
gh pr merge <pr-number> --squash --delete-branch
```

If the merge fails (conflicts, missing reviews, etc.), print the error and stop. The user is still on the feature branch; nothing destructive happened.

## Step 7 — Sync local main

```bash
git checkout main
git pull origin main
```

Verify the merged commit is now on local `main`.

## Step 8 — Prompt for `futureWorks.md` additions

Ask: "Anything outstanding from this feature to log? Paste one-liners; empty reply to skip."

If the user provides entries, append them under `## Open` in `futureWorks.md`. Format per the existing convention:

```
- [<area>] <description> — <branch> session <YYYY-MM-DD>
```

Commit and push if anything was added:

```bash
git add futureWorks.md
git commit -m "chore: log <feature> outstanding items"
git push
```

## Final summary

Print:

- Feature merged: `<feature>`
- PR: `#<n>` (URL)
- Branch deleted: ✓ local + remote
- Plan/spec at: `_plans/done/<feature>-plan.md`, `_specs/done/<feature>-spec.md`
- futureWorks: N items logged (or "none")

## On any failure

Leave the user on the feature branch. Print:

1. Which step failed
2. The exact command and its stderr
3. The recovery action (e.g., "resolve conflicts and re-run", "push the branch first", "fix the build error and re-run")

Do **not** half-finish: if Step 3 moved files but Step 6 fails to merge, leave the move-commit in place — it's already pushed and harmless on the feature branch. Just stop and tell the user where they are.
