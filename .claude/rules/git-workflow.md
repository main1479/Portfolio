# Git workflow

Auto-loaded for every task. Follow without being asked.

## Branches

- Never commit to `main`. Always work on a feature branch.
- Naming: `<type>/<short-description>` — `feature/case-study-shell`, `fix/contact-form-validation`, `chore/upgrade-next`, `refactor/extract-card`.
- Branch off `main` (after pulling latest).
- One feature per branch. If scope creeps, branch off the current branch.

## Commits

- Imperative, lowercase, specific: `add case study card to work index`, not `Added stuff` or `WIP`.
- One logical unit per commit. If you can't describe it in one short sentence, split it.
- Before each commit, scan for:
  - `console.log` (intentional ones are fine — comment them)
  - `debugger`
  - Hardcoded secrets, API keys, tokens
  - `TODO` / `FIXME` without an owner or ticket reference

## Push cadence

- **Push after every meaningful commit.** Plan → push. Spec → push. Implementation commit → push. No work stays local.
- This is solo-developer paranoia, not a team requirement. Local-only work is one disk crash away from a redo.

## Plan/spec commits

- Plan and spec files (in `_plans/` and `_specs/`) get their own commits, separate from implementation. Make them easy to revisit.
- Suggested commit messages:
  - `plan: <feature-name>` — when committing the non-technical plan
  - `spec: <feature-name>` — when committing the technical spec
  - `feat: <feature-name>` — implementation commits
  - `fix: <issue>`, `chore: <task>`, `refactor: <area>` for the rest

## Merges

- PRs go through GitHub UI. No direct push to `main`.
- Squash-merge by default to keep `main` history readable.
- Delete the branch after merge.

## Never

- `git push --force` to `main`.
- `git reset --hard` without confirming you don't need the work.
- Committing `.env*`, `node_modules/`, `.next/`, `.DS_Store`. Trust the gitignore but double-check.
