import type { Metadata } from 'next';
import Script from 'next/script';
import { Bricolage_Grotesque, JetBrains_Mono, Fraunces } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Providers } from './providers';
import './globals.css';

// Primary sans-serif - distinctive grotesque with editorial character
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '700'],
});

// Display font - editorial serif for distinctive headings (variable font with full weight range)
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '600', '700'],
});

// Monospace - for code, data, and technical elements (signature visual)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coucou-ia.com'),
  title: {
    default: 'Coucou IA | Surveillance visibilité recherche IA',
    template: '%s | Coucou IA',
  },
  description:
    'Analysez vos mentions sur ChatGPT, Claude et Mistral. Suivez votre part de voix IA et surveillez vos concurrents. Premier outil français de monitoring recherche IA. Essai gratuit.',
  keywords: [
    'surveillance visibilité IA',
    'monitoring recherche IA',
    'mentions marque ChatGPT',
    'GEO',
    'part de voix IA',
    'Generative Engine Optimization',
    'visibilité ChatGPT',
    'visibilité Claude',
    'visibilité Mistral',
    'mentions marque Mistral',
    'SEO IA',
    'monitoring LLM',
  ],
  authors: [{ name: 'Coucou IA' }],
  creator: 'Coucou IA',
  publisher: 'Coucou IA',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
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
    title: 'Coucou IA | Surveillance visibilité recherche IA',
    description:
      'Analysez vos mentions sur ChatGPT, Claude et Mistral. Premier outil français de monitoring recherche IA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coucou IA | Surveillance visibilité recherche IA',
    description: 'Analysez vos mentions sur ChatGPT, Claude et Mistral. Premier outil français.',
    creator: '@coucouia',
  },
  alternates: {
    canonical: 'https://coucou-ia.com',
    languages: { fr: 'https://coucou-ia.com', 'x-default': 'https://coucou-ia.com' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`scroll-smooth dark ${bricolageGrotesque.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#080a12" />
      </head>
      <body className="font-sans antialiased">
        {/* Google Tag Manager - loaded async after page interactive */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K7Z65296');`,
          }}
        />
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
        <SpeedInsights />
      </body>
    </html>
  );
}
