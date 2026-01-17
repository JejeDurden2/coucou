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
    default: 'Coucou IA - Votre marque est-elle visible dans les réponses IA ?',
    template: '%s | Coucou IA',
  },
  description:
    "Surveillez et améliorez la visibilité de votre marque dans les réponses de ChatGPT, Claude et autres IA. Découvrez si l'IA recommande votre entreprise.",
  keywords: [
    'visibilité IA',
    'ChatGPT',
    'Claude',
    'GEO',
    'Generative Engine Optimization',
    'marque IA',
    'SEO IA',
    'recommandation IA',
    'monitoring LLM',
    'brand visibility AI',
  ],
  authors: [{ name: 'Coucou IA' }],
  creator: 'Coucou IA',
  publisher: 'Coucou IA',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
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
    title: 'Coucou IA - Votre marque est-elle visible dans les réponses IA ?',
    description:
      "Surveillez et améliorez la visibilité de votre marque dans les réponses de ChatGPT, Claude et autres IA.",
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Coucou IA - Monitoring de visibilité IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coucou IA - Votre marque est-elle visible dans les réponses IA ?',
    description:
      "Surveillez et améliorez la visibilité de votre marque dans les réponses de ChatGPT, Claude et autres IA.",
    images: ['/twitter-image.svg'],
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
