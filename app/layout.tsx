import type { Metadata } from 'next';
import { Teko, Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import './_styles/globals.scss';
import { Nav } from './_components/Nav/Nav';
import { Footer } from './_components/Footer/Footer';
import { CustomCursor } from './_components/CustomCursor/CustomCursor';
import { RevealRoot } from './_components/RevealRoot/RevealRoot';

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
  title: 'Mainul Islam · Frontend Developer · A/B Testing & Experimentation',
  description:
    'Frontend developer specialised in A/B testing and experimentation. 4+ years across Optimizely, Kameleoon, and Qubit, plus modern frontend with Next.js and TypeScript.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${teko.variable} ${josefin.variable} ${mono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RevealRoot />
        <CustomCursor />
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
