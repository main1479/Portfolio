import type { MDXComponents } from 'mdx/types';

// App Router requires this file at the project root for MDX rendering.
// Override individual elements (e.g., img → next/image, a → next/link) here
// as the case-study templates grow.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
