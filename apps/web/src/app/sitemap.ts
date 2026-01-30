import type { MetadataRoute } from 'next';

import { getAllPosts } from '@/lib/blog';
import { getAllTerms } from '@/lib/glossary';
import { getAllPersonas } from '@/lib/geo-pour';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coucou-ia.com';
  const posts = getAllPosts();
  const terms = getAllTerms();
  const personas = getAllPersonas();

  // Use latest blog post date as proxy for blog listing / homepage freshness
  const latestPostDate = posts.length > 0 ? new Date(posts[0].date) : new Date('2026-01-01');
  const latestTermDate =
    terms.length > 0
      ? new Date(Math.max(...terms.map((t) => new Date(t.lastUpdated).getTime())))
      : new Date('2026-01-01');
  const latestPersonaDate =
    personas.length > 0
      ? new Date(Math.max(...personas.map((p) => new Date(p.lastUpdated).getTime())))
      : new Date('2026-01-01');

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/producthunt`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date('2026-01-30'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Lexique index
  const lexiqueIndex: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/lexique`,
      lastModified: latestTermDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Lexique terms
  const lexiquePages: MetadataRoute.Sitemap = terms.map((term) => ({
    url: `${baseUrl}/lexique/${term.slug}`,
    lastModified: new Date(term.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // GEO pour (personas) index
  const geoIndex: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/geo-pour`,
      lastModified: latestPersonaDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // GEO pour (personas) pages
  const geoPages: MetadataRoute.Sitemap = personas.map((persona) => ({
    url: `${baseUrl}/geo-pour/${persona.slug}`,
    lastModified: new Date(persona.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...lexiqueIndex, ...lexiquePages, ...geoIndex, ...geoPages];
}
