import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Note: `eslint-config-next/core-web-vitals` already registers
// `eslint-plugin-jsx-a11y` with a recommended ruleset. Don't import + spread
// the plugin's flatConfigs.recommended here — ESLint flat config rejects it as
// "Cannot redefine plugin". To tighten a11y rules beyond the Next defaults,
// add specific `rules: { 'jsx-a11y/...': 'error' }` entries instead.

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    "Mainul's Portfolio/**",
    '_plans/done/**',
    '_specs/done/**',
    // Claude Code config + hook scripts — not part of the Next.js source tree.
    '.claude/**',
  ]),
]);

export default eslintConfig;
