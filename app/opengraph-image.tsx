import { ImageResponse } from 'next/og';
import { siteConfig } from './_lib/site-config';

export const runtime = 'edge';
export const alt = 'Mainul Islam — Frontend Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COLOR_BG = '#f5f0ec';
const COLOR_FG = '#0a0908';
const COLOR_FG_SOFT = 'rgba(10, 9, 8, 0.78)';
const COLOR_FG_MUTED = 'rgba(10, 9, 8, 0.56)';
const COLOR_ACCENT = '#1f3a5f';
const SYSTEM_SANS = '"Helvetica Neue", Arial, sans-serif';

export default async function OGImage() {
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
        position: 'relative',
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
        Mainul Islam · v3
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 168, fontWeight: 600, lineHeight: 0.92 }}>Frontend</span>
          <span style={{ fontSize: 96, color: COLOR_ACCENT, marginLeft: 12 }}>·</span>
        </div>
        <span
          style={{
            fontSize: 168,
            fontWeight: 600,
            lineHeight: 0.92,
            color: 'transparent',
            WebkitTextStroke: '2.4px ' + COLOR_FG,
          }}
        >
          A/B testing.
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid rgba(10, 9, 8, 0.32)`,
          paddingTop: 28,
          fontSize: 26,
        }}
      >
        <span style={{ color: COLOR_FG, fontWeight: 600 }}>{siteConfig.ownerName}</span>
        <span style={{ color: COLOR_FG_SOFT }}>{siteConfig.ownerRole}</span>
      </div>
    </div>,
    { ...size },
  );
}
