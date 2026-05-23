export type NavLink = {
  num: string;
  label: string;
  href: string;
};

export type MetaLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mainul.info').replace(
  /\/$/,
  '',
);

export const cvHref = '/Resume_Mainul.pdf';

export const siteConfig = {
  ownerName: 'Mainul Islam',
  ownerRole: 'Frontend Developer · A/B Testing & Experimentation',
  email: 'm.main2402@gmail.com',
  version: 'v3',
  year: new Date().getFullYear(),
  siteUrl,
  cvHref,
  navLinks: [
    { num: '01', label: 'Index', href: '/' },
    { num: '02', label: 'Work', href: '/work' },
    { num: '03', label: 'About', href: '/about' },
    { num: '04', label: 'Contact', href: '/contact' },
  ] satisfies readonly NavLink[],
  metaLinks: [
    { label: 'GitHub ↗', href: 'https://github.com/main1479', external: true },
    { label: 'Resume / CV ↗', href: cvHref, external: true },
    { label: 'Email ↗', href: 'mailto:m.main2402@gmail.com' },
  ] satisfies readonly MetaLink[],
  footerCta: {
    lead: 'Say hello —',
  },
} as const;

export type SiteConfig = typeof siteConfig;
