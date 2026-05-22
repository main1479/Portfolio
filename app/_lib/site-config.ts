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

export const siteConfig = {
  ownerName: 'Mainul Islam',
  email: 'm.main2402@gmail.com',
  version: 'v3',
  year: '2026',
  navLinks: [
    { num: '01', label: 'Index', href: '/' },
    { num: '02', label: 'Work', href: '/work' },
    { num: '03', label: 'About', href: '/about' },
    { num: '04', label: 'Contact', href: '/contact' },
  ] satisfies readonly NavLink[],
  metaLinks: [
    { label: 'GitHub ↗', href: 'https://github.com/main1479', external: true },
    {
      label: 'Resume / CV ↗',
      href: 'https://drive.google.com/file/d/1zp7JQLgPNyEQan9bzKnLN2i-t1Du_tgI/view',
      external: true,
    },
    { label: 'Email ↗', href: 'mailto:m.main2402@gmail.com' },
  ] satisfies readonly MetaLink[],
  footerCta: {
    lead: 'Say hello —',
  },
} as const;

export type SiteConfig = typeof siteConfig;
