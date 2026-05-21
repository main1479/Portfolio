---
description: Run the code-reviewer subagent against the current uncommitted/staged diff.
---

Run the `code-reviewer` subagent on the current change.

Steps:

1. Run `git status` and `git diff` to capture what's changed (include staged via `git diff --staged`).
2. If there are no changes, say "Nothing to review" and stop.
3. Hand the diff to the `code-reviewer` subagent. Tell it whether the changes are staged, unstaged, or both.
4. Relay the subagent's verdict and findings back to me directly. Don't summarize further — its output is already structured.

Do not fix anything. This command is read-only review.
