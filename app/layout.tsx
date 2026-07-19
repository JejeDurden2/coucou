import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { description, siteName, siteUrl } from "@/content/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
});

// Titre par defaut : mots-cles en tete (conseil IA, PME, ETI), 55 caracteres.
const defaultTitle = "Coucou IA : conseil et développement IA pour PME et ETI";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName,
    url: siteUrl,
    title: defaultTitle,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Hex de --background (oklch 0.145 0.006 255) : barre du navigateur mobile assortie au fond.
export const viewport: Viewport = {
  themeColor: "#090b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`dark ${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        {/* No-JS escape: reveals SSR with inline opacity:0; this !important
            stylesheet (only applied when JS is off) forces their final state. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <a
          href="#contenu"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-60 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-4 focus-visible:py-2.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Aller au contenu principal
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
