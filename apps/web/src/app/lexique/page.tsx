import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Book } from 'lucide-react';

import { getTermsByCategory, getCategoryLabel, type GlossaryCategory } from '@/lib/glossary';
import { TermCard } from '@/components/lexique';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Lexique GEO | Définitions et glossaire du référencement IA',
  description:
    'Glossaire complet du GEO (Generative Engine Optimization). Définitions des termes essentiels pour comprendre la visibilité de marque sur ChatGPT et Claude.',
  openGraph: {
    title: 'Lexique GEO : Glossaire du référencement IA | Coucou IA',
    description:
      'Définitions des termes essentiels pour comprendre la visibilité de marque sur ChatGPT et Claude.',
    type: 'website',
  },
  twitter: {
    title: 'Lexique GEO | Coucou IA',
    description: 'Glossaire complet du GEO et du référencement IA.',
  },
  alternates: {
    canonical: 'https://coucou-ia.com/lexique',
  },
};

const CATEGORY_ORDER: GlossaryCategory[] = [
  'geo-fondamentaux',
  'metriques',
  'technique',
  'strategie',
  'comparaison',
];

export default function LexiquePage(): React.ReactNode {
  const termsByCategory = getTermsByCategory();
  const hasTerms = Object.values(termsByCategory).some((terms) => terms.length > 0);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Retour au site
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
            <Book className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground text-balance">
            Lexique GEO
          </h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Glossaire des termes essentiels pour comprendre le GEO (Generative Engine Optimization)
            et la visibilité de marque dans les IA.
          </p>
        </div>

        {!hasTerms ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-pretty">
              Le lexique est en cours de rédaction.
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
              const terms = termsByCategory[category];
              if (terms.length === 0) return null;

              return (
                <section key={category}>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">
                    {getCategoryLabel(category)}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {terms.map((term) => (
                      <TermCard key={term.slug} term={term} />
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

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>
            <p className="text-sm text-muted-foreground">Votre visibilité dans les IA</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
