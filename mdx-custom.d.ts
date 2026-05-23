declare module '*.mdx' {
  import type { CaseFrontmatter } from './app/_types/case';

  export const frontmatter: CaseFrontmatter;
}
