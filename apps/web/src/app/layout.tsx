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
    default: 'Coucou IA — Surveillance de votre visibilité dans la recherche IA',
    template: '%s | Coucou IA',
  },
  description:
    'Analysez vos mentions sur ChatGPT et Claude. Suivez votre part de voix IA et surveillez vos concurrents. Premier outil français de monitoring recherche IA. Essai gratuit.',
  keywords: [
    'surveillance visibilité IA',
    'monitoring recherche IA',
    'mentions marque ChatGPT',
    'GEO',
    'part de voix IA',
    'Generative Engine Optimization',
    'visibilité ChatGPT',
    'visibilité Claude',
    'SEO IA',
    'monitoring LLM',
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
    title: 'Coucou IA — Surveillance visibilité recherche IA',
    description:
      'Analysez vos mentions sur ChatGPT et Claude. Premier outil français de monitoring recherche IA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coucou IA — Surveillance visibilité recherche IA',
    description: 'Analysez vos mentions sur ChatGPT et Claude. Premier outil français.',
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K7Z65296');`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K7Z65296"
            height="0"
            width="0"
            title="Google Tag Manager"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
