import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

// Primary sans-serif - clean and modern
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// Display font - geometric and tech-forward for headings
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

// Monospace - for code, data, and technical elements
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coucou-ia.com'),
  title: {
    default: 'Coucou IA - Outil GEO pour améliorer votre visibilité dans ChatGPT et Claude',
    template: '%s | Coucou IA',
  },
  description:
    'Outil GEO français pour surveiller et améliorer la visibilité de votre marque dans ChatGPT et Claude. Gratuit pour démarrer. +500 marques utilisent Coucou IA.',
  keywords: [
    'GEO',
    'Generative Engine Optimization',
    'visibilité IA',
    'visibilité ChatGPT',
    'visibilité Claude',
    'SEO IA',
    'référencement IA',
    'marque ChatGPT',
    'monitoring LLM',
    'optimisation IA',
  ],
  authors: [{ name: 'Coucou IA' }],
  creator: 'Coucou IA',
  publisher: 'Coucou IA',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://coucou-ia.com',
    siteName: 'Coucou IA',
    title: 'Coucou IA - Outil GEO pour améliorer votre visibilité dans ChatGPT et Claude',
    description:
      'Surveillez et améliorez la visibilité de votre marque dans les réponses de ChatGPT et Claude. Le GEO, c\'est le nouveau SEO.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coucou IA - Outil GEO pour améliorer votre visibilité dans ChatGPT et Claude',
    description:
      'Surveillez et améliorez la visibilité de votre marque dans les réponses de ChatGPT et Claude. Le GEO, c\'est le nouveau SEO.',
    creator: '@coucouia',
  },
  alternates: {
    canonical: 'https://coucou-ia.com',
  },
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`scroll-smooth dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#080a12" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
