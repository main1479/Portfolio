# Plan + Spec — `chore/repo-init`

> Combined plan + spec per `CLAUDE.md:91`. Bounded, mechanical bootstrap work.

**Status:** Implemented in the baseline commit
**Date:** 2026-05-21
**Branch:** N/A — one-time bootstrap exception, see below

---

## What

Turn the Portfolio directory into a real git repo with a GitHub remote and a single baseline commit, so every subsequent feature can follow the proper `feature/...` → PR → squash-merge workflow.

Five mechanical steps:

1. `git init` (default branch `main`).
2. Confirm `.gitignore` covers everything we don't want tracked — including the legacy template folder.
3. Verify `gh` is authenticated.
4. Create a GitHub remote via `gh repo create`.
5. Stage everything currently on disk and commit as the baseline; push `main` to GitHub.

## Why

The whole workflow in `CLAUDE.md` assumes a git repo and a GitHub remote. Right now neither exists:

- `git status` errors out → the block-main hook is harmless but unverifiable.
- `gh pr create` has nowhere to go → `/finish-feature` would refuse at step 1.
- "Always push after every meaningful change" is unfulfillable.

This unblocks all of the above. Once done, the next plan (`chore/nextjs-scaffold`) can be the **first feature** that actually exercises the full workflow end-to-end, including `/finish-feature`.

## Bootstrap exception

`CLAUDE.md` rule #1 — "Never commit to `main`" — has to be relaxed exactly once: for the initial baseline commit. There is no `main` to branch off until the first commit lands. After that commit, the rule applies normally and every future change goes through a feature branch + PR.

This exception is documented here and called out in the retrospective. No subsequent change touches main directly.

## Decisions I'm making (override these in your approval)

| Decision | Default | Why |
|---|---|---|
| **Default branch name** | **`main`** | CLAUDE.md, hooks, and rules all reference `main`. Consistent |
| **Where the GitHub repo lives** | **`main1479/portfolio`** | Username inferred from the existing GitHub link in `Mainul's Portfolio/index.html` (`href="https://github.com/main1479"`). Repo name `portfolio` is the obvious slug |
| **Visibility** | **Private at first, flip to public when launch-ready** | Lets us bootstrap without putting half-built scaffolding on display. Flipping to public is one CLI command |
| **Description** | `"Personal portfolio — frontend dev specialising in A/B testing & experimentation"` | Mirrors the static template's `<meta name="description">` |
| **Initial commit message** | `chore: bootstrap repo with claude code scaffold and port plan` | Imperative, lowercase, specific, per `git-workflow.md:13` |
| **License file** | **None added in this commit** | The repo is private at first; license decision belongs to the launch step |
| **README.md** | **None added in this commit** | Per `CLAUDE.md:246` — "No README.md filler. The README will be written when the site is launched" |
| **Legacy template `Mainul's Portfolio/`** | **Gitignored, kept on disk as reference** | Confirmed earlier in the session. Add to `.gitignore` before the first commit so it doesn't get tracked |
| **Tagging** | **No tag on baseline** | Portfolios don't version; skip |
| **Remote name** | **`origin`** | Default; no reason to vary |

## Open questions (need a direct answer in your approval)

1. **Repo name:** stick with `portfolio`, or use something else (`mainul-portfolio`, `mainul.dev`, `m-main2402-portfolio`)?
2. **Visibility:** private first or public from day one?
3. **`gh` authentication:** I'll verify with `gh auth status` before the create step — if you're not signed in I'll stop and ask. No way around that.

Anything else you want to override (description, commit message, default branch), say so in your approval.

## Step-by-step procedure

### Step 1 — Pre-flight

```bash
# In the Portfolio directory
gh auth status                 # must succeed; stop and ask if it doesn't
git --version                  # confirm git is installed
ls -la                         # final check we're in the right dir
```

### Step 2 — Add the legacy template to .gitignore

Append to `.gitignore` (don't replace):

```
# Legacy static-HTML draft — kept on disk as reference only, never committed
Mainul's Portfolio/
```

Filename has a space and an apostrophe; gitignore handles both literally without escaping.

### Step 3 — `git init` with `main` as default

```bash
git init -b main
```

`-b main` sets the initial branch directly. If git is too old to support `-b`, fall back to `git init && git branch -M main`.

### Step 4 — Stage and commit the baseline

```bash
git add .
git status        # human-readable preview — paste back to user before committing
git commit -m "chore: bootstrap repo with claude code scaffold and port plan"
```

Files expected to land in this commit (rough — confirm via `git status`):
- `CLAUDE.md`
- `.claude/` (settings.json, settings.local.json, agents/, commands/, hooks/, rules/, skills/)
- `_plans/` (claude-config-cleanup, finish-feature, repo-init — this plan, status updated to "Implemented" in the same commit)
- `_specs/` (claude-config-cleanup)
- `futureWorks.md`
- `.gitignore`

Files expected to be excluded (sanity-check via `git status --ignored`):
- `Mainul's Portfolio/` (gitignored per Step 2)
- `.DS_Store`
- Anything under `.claude/settings.local.json` (gitignored per the existing `.gitignore`)

### Step 5 — Create the GitHub remote and push

```bash
gh repo create main1479/portfolio \
  --private \
  --description "Personal portfolio — frontend dev specialising in A/B testing & experimentation" \
  --source=. \
  --remote=origin \
  --push
```

`--source=. --push` pushes `main` to the new remote in the same command. If `gh` rejects (already exists, name taken, etc.), stop and ask.

If you want public, swap `--private` for `--public` — that's the override.

### Step 6 — Verify

```bash
git remote -v                          # expect origin pointing at github.com/main1479/portfolio
git log --oneline                      # expect exactly one commit
git status                             # expect clean working tree
gh repo view --json url,visibility,defaultBranchRef
```

### Step 7 — Update plan status and `futureWorks.md`

In the same baseline commit, this plan's status header was already updated to "Implemented". If we forgot, do it in a small follow-up commit on a feature branch — but ideally it lands in the bootstrap commit.

Append a `futureWorks.md` entry under "## Open":

```
- [bootstrap] First feature merge (`chore/nextjs-scaffold`) is the real end-to-end test for `/finish-feature`. Verify all 9 steps run cleanly there before declaring the workflow stable. — `chore/repo-init` session 2026-05-21
```

## Verification (after Step 6)

| Check | Expected |
|---|---|
| `git rev-parse --is-inside-work-tree` | `true` |
| `git symbolic-ref --short HEAD` | `main` |
| `git log --oneline \| wc -l` | `1` |
| `git remote -v` | shows `origin` pointing at github.com/main1479/portfolio (or chosen name) |
| `gh pr list` | empty (no PRs yet) |
| `git status --porcelain` | empty (clean tree) |
| The block-main hook fires correctly | Try `git commit --allow-empty -m "test"` on main → expect BLOCKED (this confirms the hook is now live since we have a real branch) |
| `Mainul's Portfolio/` is untracked + ignored | `git status --ignored \| grep "Mainul's Portfolio"` shows it under ignored, not tracked |

## Edge cases

- **`gh` not authenticated.** Stop, print: "Run `gh auth login` and re-invoke." Do not proceed.
- **`main1479/portfolio` already exists.** Stop, ask user for a different name.
- **Local dir is already a git repo** (somehow). `git rev-parse --is-inside-work-tree` returns `true` before Step 3 — stop and ask before reinitializing.
- **Block-main hook trips on the bootstrap commit itself.** It shouldn't, because the hook checks `git symbolic-ref --short HEAD` and at the moment of commit we're still on `main` with no commits — the hook's regex matches `git commit`, the branch check sees `main`, and it will block.
  - **Mitigation:** temporarily disable the hook for the bootstrap commit via `CLAUDE_DISABLE_HOOKS=1` env var if Claude Code supports it, OR run the bootstrap commit from a terminal (outside Claude) so the hook doesn't intercept, OR amend the hook to allow commits when `HEAD` doesn't yet exist (first commit case).
  - **My recommendation:** run Step 4's `git commit` from a terminal directly (no Claude tool wrapper), since this is the one explicit exception. After the baseline lands, the hook should operate normally from inside Claude Code sessions.

## Risk

Low and reversible. If anything goes wrong before the GitHub remote is created, `rm -rf .git` undoes everything locally. If the remote is created but unwanted, `gh repo delete main1479/portfolio --yes` removes it.

The only step with real consequence is the `gh repo create` — once a public repo exists at a URL, that URL is part of the user's GitHub footprint even if deleted shortly after. Starting private mitigates this.

## Out of scope

- Branch protection rules on `main` (require PR, require status checks). Defer until CI exists.
- GitHub Actions / CI. `CLAUDE.md:245` says no CI yet.
- Issue templates, PR templates, code-of-conduct. Defer to the launch step.
- Adding a `LICENSE` file. Decided above; defer.
- Adding a `README.md`. Decided above; defer.
- Inviting collaborators. Solo project.
