import { ImageResponse } from 'next/og';
import { siteConfig } from '../../_lib/site-config';
import type { CaseHeroLine } from '../../_types/case';
import { frontmatter } from './content.mdx';

export const runtime = 'edge';
export const alt = `${frontmatter.title} — case study by ${siteConfig.ownerName}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_BG = '#f5f0ec';
const COLOR_FG = '#0a0908';
const COLOR_FG_SOFT = 'rgba(10, 9, 8, 0.78)';
const COLOR_FG_MUTED = 'rgba(10, 9, 8, 0.56)';
const COLOR_ACCENT = '#1f3a5f';
const SYSTEM_SANS = '"Helvetica Neue", Arial, sans-serif';

export default async function CaseOG() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: COLOR_BG,
        color: COLOR_FG,
        fontFamily: SYSTEM_SANS,
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 88px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 24,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLOR_FG_MUTED,
        }}
      >
        <span style={{ display: 'block', width: 56, height: 2, background: COLOR_ACCENT }} />
        Case · {frontmatter.num} — {frontmatter.title}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 24,
          lineHeight: 0.92,
        }}
      >
        {frontmatter.heroLines.map((line: CaseHeroLine, i: number) => {
          if (line.style === 'accent') {
            return (
              <span key={i} style={{ fontSize: 144, fontWeight: 600, color: COLOR_ACCENT }}>
                {line.text}
                {line.trailingAccentDot && '.'}
              </span>
            );
          }
          if (line.style === 'outline') {
            return (
              <span
                key={i}
                style={{
                  fontSize: 144,
                  fontWeight: 600,
                  color: 'transparent',
                  WebkitTextStroke: '2.4px ' + COLOR_FG,
                }}
              >
                {line.text}
              </span>
            );
          }
          return (
            <span key={i} style={{ fontSize: 144, fontWeight: 600, color: COLOR_FG }}>
              {line.text}
              {line.trailingAccentDot && <span style={{ color: COLOR_ACCENT }}>.</span>}
            </span>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid rgba(10, 9, 8, 0.32)`,
          paddingTop: 28,
          gap: 32,
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 600 }}>{siteConfig.ownerName}</span>
        <span
          style={{
            fontSize: 22,
            color: COLOR_FG_SOFT,
            maxWidth: 720,
            textAlign: 'right',
            lineHeight: 1.3,
          }}
        >
          {frontmatter.summary.length > 140
            ? frontmatter.summary.slice(0, 137).trimEnd() + '…'
            : frontmatter.summary}
        </span>
      </div>
    </div>,
    { ...size },
  );
}
