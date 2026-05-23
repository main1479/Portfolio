import type { Metadata } from 'next';
import { Teko, Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import './_styles/globals.scss';
import { Nav } from './_components/Nav/Nav';
import { CustomCursor } from './_components/CustomCursor/CustomCursor';
import { Loader } from './_components/Loader/Loader';
import { siteConfig } from './_lib/site-config';

const teko = Teko({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const josefin = Josefin_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    template: `%s · ${siteConfig.ownerName}`,
  },
  description:
    'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
  applicationName: 'Mainul Islam — Portfolio',
  authors: [{ name: siteConfig.ownerName, url: siteConfig.siteUrl }],
  creator: siteConfig.ownerName,
  publisher: siteConfig.ownerName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Mainul Islam',
    url: siteConfig.siteUrl,
    title: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    description:
      'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.ownerName} · ${siteConfig.ownerRole}`,
    description:
      'Frontend developer specialised in A/B testing and experimentation. Builds CLI-driven experimentation platforms and ships conversion experiments for ecommerce + SaaS clients.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${teko.variable} ${josefin.variable} ${mono.variable}`}>
      <body>
        <Loader />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CustomCursor />
        <Nav />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
