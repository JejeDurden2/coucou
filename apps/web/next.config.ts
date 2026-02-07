import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  transpilePackages: ['@coucou-ia/shared'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-slot',
      'class-variance-authority',
      'recharts',
      '@coucou-ia/shared',
    ],
  },
  async redirects() {
    return [
      {
        source: '/lexique/',
        destination: '/lexique',
        permanent: true,
      },
      {
        source: '/blog/',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug/',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/lexique/:slug/',
        destination: '/lexique/:slug',
        permanent: true,
      },
      {
        source: '/geo-pour/:slug/',
        destination: '/geo-pour/:slug',
        permanent: true,
      },
      {
        source: '/geo-pour/',
        destination: '/geo-pour',
        permanent: true,
      },
      {
        source: '/privacy/',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/terms/',
        destination: '/terms',
        permanent: true,
      },
      {
        source: '/mentions-legales/',
        destination: '/mentions-legales',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
