import type { NextConfig } from 'next';
import createMDX from '@next/mdx';
import path from 'node:path';

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const stylesDir = path.join(process.cwd(), 'app/_styles');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://cdn.mainul.info/**')],
  },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  sassOptions: {
    loadPaths: [stylesDir],
    // Auto-inject our global tokens into every component .module.scss, but
    // skip files in app/_styles/ themselves so partials don't @use themselves.
    additionalData: (content: string, loaderContext: { resourcePath: string }): string => {
      if (loaderContext.resourcePath.startsWith(stylesDir)) {
        return content;
      }
      return `@use 'variables' as *; @use 'mixins' as *;\n${content}`;
    },
  },
};

export default withMDX(nextConfig);
