import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

import { getPersona, getAllPersonaSlugs, getRelatedPersonas } from '@/lib/geo-pour';
import { PersonaContent, PersonaCard } from '@/components/geo-pour';
import { Logo } from '@/components/ui/logo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = getAllPersonaSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const persona = await getPersona(slug);

  if (!persona) {
    return { title: 'Page non trouvée' };
  }

  const url = `https://coucou-ia.com/geo-pour/${slug}`;

  return {
    title: persona.metaTitle,
    description: persona.metaDescription,
    keywords: [
      `GEO pour ${persona.persona}`,
      'GEO',
      'visibilité IA',
      persona.persona,
      'ChatGPT',
      'Claude',
    ],
    openGraph: {
      title: persona.metaTitle,
      description: persona.metaDescription,
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: persona.metaTitle,
      description: persona.metaDescription,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PersonaPage({ params }: PageProps): Promise<React.ReactNode> {
  const { slug } = await params;
  const persona = await getPersona(slug);

  if (!persona) {
    notFound();
  }

  const relatedPersonas = getRelatedPersonas(slug);

  const formattedDate = new Date(persona.lastUpdated).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // JSON-LD: Article schema
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: persona.headline,
    description: persona.metaDescription,
    author: {
      '@type': 'Organization',
      name: 'Coucou IA',
      url: 'https://coucou-ia.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coucou IA',
      url: 'https://coucou-ia.com',
    },
    dateModified: persona.lastUpdated,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coucou-ia.com/geo-pour/${slug}`,
    },
  };

  // JSON-LD: FAQPage schema (if persona has FAQ)
  const faqJsonLd =
    persona.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: persona.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

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
        item: 'https://coucou-ia.com/geo-pour',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: persona.persona,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-dvh bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" />
              </Link>
              <Link
                href="/geo-pour"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Tous les métiers
              </Link>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="mx-auto max-w-3xl px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Fil d'Ariane">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/geo-pour" className="hover:text-foreground">
                  GEO par métier
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{persona.persona}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight text-balance">
              {persona.headline}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden="true" />
                Mis à jour le {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {persona.readingTime}
              </span>
            </div>
          </header>

          {/* Pain Points */}
          {persona.painPoints.length > 0 && (
            <section className="mb-10 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
                Les défis du GEO pour {persona.persona.toLowerCase()}
              </h2>
              <ul className="space-y-3">
                {persona.painPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="shrink-0 mt-1 size-1.5 rounded-full bg-destructive/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Benefits */}
          {persona.benefits.length > 0 && (
            <section className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                Ce que Coucou IA vous apporte
              </h2>
              <ul className="space-y-3">
                {persona.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="shrink-0 mt-1 size-1.5 rounded-full bg-primary/60" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Main Content */}
          <PersonaContent content={persona.content} />

          {/* FAQ Section */}
          {persona.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Questions fréquentes
              </h2>
              <div className="space-y-6">
                {persona.faq.map((item, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-muted-foreground text-pretty">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Personas */}
          {relatedPersonas.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                GEO pour d&apos;autres métiers
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPersonas.map((p) => (
                  <PersonaCard key={p.slug} persona={p} />
                ))}
              </div>
            </section>
          )}

          {/* Related Lexique Terms */}
          {persona.relatedLexique.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Termes du lexique associés
              </h2>
              <div className="flex flex-wrap gap-2">
                {persona.relatedLexique.map((termSlug) => (
                  <Link
                    key={termSlug}
                    href={`/lexique/${termSlug}`}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    {termSlug}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Footer CTA */}
          <footer className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
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
          </footer>
        </article>

        {/* Site Footer */}
        <footer className="border-t border-border mt-20">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo size="sm" />
              </Link>
              <p className="text-sm text-muted-foreground">Votre visibilité dans les IA</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
