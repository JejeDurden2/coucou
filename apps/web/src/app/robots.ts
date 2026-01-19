import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/onboarding', '/billing', '/settings', '/projects/'],
      },
    ],
    sitemap: 'https://coucou-ia.com/sitemap.xml',
  };
}
