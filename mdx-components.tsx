import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CaseBlock } from './app/work/_components/case/CaseBlock';
import { CaseVisuals } from './app/work/_components/case/CaseVisuals';
import { CodeMock } from './app/work/_components/case/CodeMock';
import { Countries } from './app/work/_components/case/Countries';
import { CaseImage } from './app/work/_components/case/CaseImage';

const isInternalHref = (href: string) => href.startsWith('/') || href.startsWith('#');
const isMailto = (href: string) => href.startsWith('mailto:');

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({ href, children, ...rest }) => {
      if (!href) return <a {...rest}>{children}</a>;
      if (isInternalHref(href)) {
        return (
          <Link href={href} {...rest}>
            {children}
          </Link>
        );
      }
      if (isMailto(href)) {
        return (
          <a href={href} {...rest}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    },
    img: ({ src, alt, width, height, ...rest }) => (
      <CaseImage
        src={typeof src === 'string' ? src : ''}
        alt={alt ?? ''}
        width={typeof width === 'number' ? width : Number(width ?? 1200)}
        height={typeof height === 'number' ? height : Number(height ?? 800)}
        {...rest}
      />
    ),
    CaseBlock,
    CaseVisuals,
    CodeMock,
    Countries,
  };
}
