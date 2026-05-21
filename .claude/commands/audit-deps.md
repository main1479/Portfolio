---
description: Audit dependencies (or a candidate one before adding) for supply-chain risk on this static portfolio site.
---

Audit dependencies for supply-chain risk. Two modes:

**Mode A — audit existing tree** (no argument): inspect what's already installed.

1. If `package-lock.json` exists, run `npm audit --omit=dev` and report findings.
2. Run `npm outdated` and list packages that are >1 major version behind.
3. List direct dependencies from `package.json` (not transitives). For any single-maintainer or sub-1k weekly-download package, hand it to the `security-reviewer` subagent for a deeper look.

**Mode B — vet a candidate** (argument: `<package-name>`): the user is considering adding it.

1. Fetch its npm registry entry — note maintainers, first publish, latest publish, weekly downloads, GitHub repo link.
2. Check the GitHub repo for: open issues count, last commit date, license, contributor count.
3. Check if the install tree is small or pulls in known-bloat (e.g., lodash, moment, axios when fetch would do).
4. Recommendation: **approve** / **approve with concerns** / **reject**, with reasons in 3 bullets max.

This is a portfolio site — bias hard toward fewer dependencies. The default answer to "should I add this?" is "no, can it be done in 20 lines?"
