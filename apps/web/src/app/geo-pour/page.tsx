import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';

import { getAllPersonas } from '@/lib/geo-pour';
import { PersonaCard } from '@/components/geo-pour';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'GEO par Métier | Optimisation IA par secteur',
  description:
    "Découvrez comment le GEO (Generative Engine Optimization) s'applique à votre métier. Guides dédiés pour startups, e-commerce, agences SEO, SaaS et plus.",
  openGraph: {
    title: 'GEO par Métier : Guides par secteur | Coucou IA',
    description:
      'Stratégies GEO adaptées à votre activité. Apparaissez dans les recommandations de ChatGPT et Claude.',
    type: 'website',
    url: 'https://coucou-ia.com/geo-pour',
  },
  twitter: {
    title: 'GEO par Métier | Coucou IA',
    description: 'Guides GEO par secteur : startups, e-commerce, agences, SaaS...',
  },
  alternates: {
    canonical: 'https://coucou-ia.com/geo-pour',
    languages: {
      fr: 'https://coucou-ia.com/geo-pour',
      'x-default': 'https://coucou-ia.com/geo-pour',
    },
  },
};

export default function GeoIndexPage(): React.ReactNode {
  const personas = getAllPersonas();
  const hasPersonas = personas.length > 0;

  // JSON-LD: CollectionPage schema
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GEO par Métier',
    description: "Guides GEO (Generative Engine Optimization) par secteur d'activité.",
    url: 'https://coucou-ia.com/geo-pour',
    publisher: {
      '@type': 'Organization',
      name: 'Coucou IA',
      url: 'https://coucou-ia.com',
    },
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://coucou-ia.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'GEO par métier',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="flex min-h-dvh flex-col bg-background">
        <Header variant="blog" />

        {/* Main */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-28">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Users className="size-6 text-primary" aria-hidden="true" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground text-balance">
              GEO par Métier
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
              Le GEO (Generative Engine Optimization) s&apos;applique différemment selon votre
              secteur. Découvrez les stratégies adaptées à votre activité pour apparaître dans les
              recommandations de ChatGPT et Claude.
            </p>
          </div>

          {!hasPersonas ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-pretty">
                Les guides par métier sont en cours de rédaction.
              </p>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">Revenez bientôt !</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Retour à l&apos;accueil
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {personas.map((persona) => (
                <PersonaCard key={persona.slug} persona={persona} />
              ))}
            </div>
          )}

          {/* CTA */}
          <section className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground text-balance">
              Mesurez votre visibilité GEO
            </h2>
            <p className="mt-2 text-muted-foreground text-pretty">
              Découvrez si ChatGPT et Claude recommandent votre marque.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Essayer gratuitement
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
