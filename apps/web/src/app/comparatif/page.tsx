import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale } from 'lucide-react';

import {
  getComparisonsByCategory,
  getCategoryLabel,
  type ComparisonCategory,
} from '@/lib/comparatif';
import { ComparisonCard } from '@/components/comparatif';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { JsonLd } from '@/components/seo/json-ld';

export const metadata: Metadata = {
  title: 'Comparatifs GEO & IA | GEO vs SEO, LLM, Outils',
  description:
    'Comparatifs détaillés : GEO vs SEO, ChatGPT vs Claude pour la visibilité, Coucou IA vs alternatives. Guides pour choisir la bonne stratégie de visibilité IA.',
  openGraph: {
    title: 'Comparatifs GEO & IA | Coucou IA',
    description:
      'Comparatifs détaillés pour comprendre le GEO et choisir les bons outils de visibilité IA.',
    type: 'website',
    url: 'https://coucou-ia.com/comparatif',
  },
  twitter: {
    title: 'Comparatifs GEO & IA | Coucou IA',
    description: 'GEO vs SEO, ChatGPT vs Claude, outils GEO : tous les comparatifs.',
  },
  alternates: {
    canonical: 'https://coucou-ia.com/comparatif',
    languages: {
      fr: 'https://coucou-ia.com/comparatif',
      'x-default': 'https://coucou-ia.com/comparatif',
    },
  },
};

const COLLECTION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Comparatifs GEO & IA',
  description:
    'Comparatifs détaillés : GEO vs SEO, ChatGPT vs Claude pour la visibilité, Coucou IA vs alternatives.',
  url: 'https://coucou-ia.com/comparatif',
  publisher: {
    '@type': 'Organization',
    name: 'Coucou IA',
    url: 'https://coucou-ia.com',
  },
};

const BREADCRUMB_SCHEMA = {
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
      name: 'Comparatifs',
    },
  ],
};

const CATEGORY_ORDER: ComparisonCategory[] = [
  'geo-vs-marketing',
  'llm-vs-llm',
  'outil-vs-outil',
  'alternative',
];

export default function ComparatifPage(): React.ReactNode {
  const comparisonsByCategory = getComparisonsByCategory();
  const hasComparisons = Object.values(comparisonsByCategory).some(
    (comparisons) => comparisons.length > 0,
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header variant="blog" />
      <JsonLd data={COLLECTION_SCHEMA} />
      <JsonLd data={BREADCRUMB_SCHEMA} />

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Scale className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground text-balance md:text-4xl">
            Comparatifs GEO &amp; IA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            GEO vs SEO, ChatGPT vs Claude, outils de monitoring : comparez pour choisir la bonne
            stratégie de visibilité IA.
          </p>
        </div>

        {!hasComparisons ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-pretty">
              Les comparatifs sont en cours de rédaction.
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
          <div className="space-y-12">
            {CATEGORY_ORDER.map((category) => {
              const comparisons = comparisonsByCategory[category];
              if (comparisons.length === 0) return null;

              return (
                <section key={category}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    {getCategoryLabel(category)}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {comparisons.map((comparison) => (
                      <ComparisonCard key={comparison.slug} comparison={comparison} />
                    ))}
                  </div>
                </section>
              );
            })}
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
  );
}
