// PreToolUse hook on Bash: block `git push` / `git commit` when on `main` (or `master`).
//
// Decides by checking the actual current branch via `git symbolic-ref` — NOT by
// regex-matching the word "main" in the command string. The old approach produced
// false positives on commit messages containing the word "main" (e.g.
// `git commit -m "fix main nav"`).
//
// Exit code 2 = block; stderr is shown to Claude. Exit 0 = pass through.

let data = '';
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    // Malformed input — be permissive, let the tool call proceed.
    console.log(data);
    return;
  }
  const cmd = (input.tool_input && input.tool_input.command) || '';

  // Only intercept literal `git push` or `git commit` at the start of the command.
  // Amends/no-edit are excluded (they target an existing commit on the current
  // branch, which is already not main if the previous block worked).
  const isPush = /^\s*git\s+push(\s|$)/.test(cmd);
  const isCommit =
    /^\s*git\s+commit(\s|$)/.test(cmd) && !/(--amend|--no-edit)\b/.test(cmd);

  if (isPush || isCommit) {
    try {
      const { execSync } = require('child_process');
      // First-commit edge case: when the repo has no commits yet, HEAD exists
      // (points at refs/heads/main) but `git rev-parse HEAD` fails. The single
      // bootstrap commit on main is allowed in that state — see _plans/repo-init-plan.md.
      try {
        execSync('git rev-parse HEAD', {
          stdio: ['ignore', 'pipe', 'ignore'],
        });
      } catch {
        // No commits yet — let the bootstrap commit through.
        console.log(data);
        return;
      }
      const branch = execSync('git symbolic-ref --short HEAD', {
        stdio: ['ignore', 'pipe', 'ignore'],
      })
        .toString()
        .trim();
      if (branch === 'main' || branch === 'master') {
        console.error(
          '[Hook] BLOCKED: direct ' +
            (isPush ? 'push' : 'commit') +
            ' on `' +
            branch +
            '` is not allowed on this project. Switch to a feature branch.'
        );
        process.exit(2);
      }
    } catch {
      // Not in a git repo, detached HEAD, or git not installed — let the
      // command through. This keeps the hook harmless before `git init`.
    }
  }

  console.log(data);
});
