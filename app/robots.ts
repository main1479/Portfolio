import type { MetadataRoute } from 'next';
import { siteConfig } from './_lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cv'],
      },
    ],
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
