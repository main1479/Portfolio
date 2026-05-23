import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f0ec',
        color: '#0a0908',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontWeight: 700,
        fontSize: 116,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 36,
      }}
    >
      M<span style={{ color: '#1f3a5f' }}>.</span>
    </div>,
    { ...size },
  );
}
