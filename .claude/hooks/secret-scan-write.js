// PreToolUse hook: scan Write content for hardcoded secrets / dangerous patterns
// before the file is saved. Exit code 2 = block; stderr is shown to Claude.
//
// Scope tuned for a portfolio site (no DB, no auth) — focuses on the patterns
// that actually matter: API keys, tokens, .env writes, dangerouslySetInnerHTML
// without sanitization, eval, and auth tokens in localStorage.

let data = '';
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(data);
  } catch {
    console.log(data);
    return;
  }
  const filePath = input.tool_input?.file_path || '';
  const content = input.tool_input?.content || '';

  // Skip non-source files — markdown/images/styles don't carry runtime secrets
  if (/\.(md|json|svg|png|jpg|jpeg|gif|webp|ico|txt|css|scss)$/i.test(filePath)) {
    console.log(data);
    return;
  }

  const violations = [];

  // CRITICAL: writing a .env file (except .env.example)
  if (
    /\.env(\.local|\.production|\.development|\.preview)?$/.test(filePath) &&
    !/\.example/.test(filePath)
  ) {
    violations.push(
      'CRITICAL: Attempting to write a .env file via code. Manage .env files manually.',
    );
  }

  // CRITICAL: API keys, secrets, tokens assigned to variables
  if (
    /(?:api[_-]?key|api[_-]?secret|secret[_-]?key|access[_-]?token|auth[_-]?token|private[_-]?key)\s*[:=]\s*['"][A-Za-z0-9_\-./+]{16,}['"]/i.test(
      content,
    )
  ) {
    violations.push('CRITICAL: Possible hardcoded API key or token. Use process.env.* instead.');
  }

  // CRITICAL: AWS access keys
  if (/(?:AKIA|ASIA)[A-Z0-9]{16,}/.test(content)) {
    violations.push('CRITICAL: AWS access key pattern detected. Never hardcode AWS credentials.');
  }

  // CRITICAL: hardcoded Bearer token
  if (/['"]Bearer\s+[A-Za-z0-9_\-./+]{20,}['"]/.test(content)) {
    violations.push('CRITICAL: Hardcoded Bearer token detected. Use environment variables.');
  }

  // CRITICAL: Resend / common service key patterns (re_*, sk_*, pk_live_*, ghp_*)
  if (
    /['"](?:re_|sk_live_|sk_test_|pk_live_|ghp_|github_pat_|xoxb-|xoxp-)[A-Za-z0-9_\-]{16,}['"]/.test(
      content,
    )
  ) {
    violations.push(
      'CRITICAL: Hardcoded service key pattern detected (Resend / Stripe / GitHub / Slack). Use process.env.*.',
    );
  }

  // HIGH: dangerouslySetInnerHTML without visible sanitization
  if (/dangerouslySetInnerHTML/.test(content) && !/sanitize|DOMPurify|xss/i.test(content)) {
    violations.push(
      'HIGH: dangerouslySetInnerHTML without visible sanitization. Use DOMPurify or similar, and leave a comment.',
    );
  }

  // HIGH: eval / new Function()
  if (/\beval\s*\(/.test(content) || /new\s+Function\s*\(/.test(content)) {
    violations.push('HIGH: eval() or new Function() detected. Both are code-injection risks.');
  }

  // HIGH: auth tokens in localStorage
  if (/localStorage\s*\.\s*setItem\s*\(\s*['"](?:token|auth|session|jwt|access)/i.test(content)) {
    violations.push(
      'HIGH: Storing auth-shaped tokens in localStorage is insecure. Prefer httpOnly cookies.',
    );
  }

  if (violations.length > 0) {
    console.error(
      '[Security Hook] VIOLATIONS DETECTED:\n' + violations.map((v) => '  - ' + v).join('\n'),
    );
    if (violations.some((v) => v.startsWith('CRITICAL'))) {
      console.error(
        '\n[Security Hook] BLOCKED: Critical violations must be fixed before writing this file.',
      );
      process.exit(2);
    }
  }

  console.log(data);
});
