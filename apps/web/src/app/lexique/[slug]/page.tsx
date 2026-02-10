import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock } from 'lucide-react';

import { getTerm, getAllTermSlugs, getRelatedTerms } from '@/lib/glossary';
import { findPostsForTerm } from '@/lib/cross-links';
import { TermCard } from '@/components/lexique';
import { PostCard } from '@/components/blog';
import { ProseContent } from '@/components/ui/prose-content';
import { JsonLd } from '@/components/seo/json-ld';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = getAllTermSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTerm(slug);

  if (!term) {
    return { title: 'Terme non trouvé' };
  }

  const url = `https://coucou-ia.com/lexique/${slug}`;
  const title = `${term.term} : Définition GEO`;

  return {
    title,
    description: term.definition,
    keywords: [
      term.term,
      ...(term.termEn ? [term.termEn] : []),
      ...term.aliases,
      'GEO',
      'définition',
    ],
    openGraph: {
      title,
      description: term.definition,
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary',
      title,
      description: term.definition,
    },
    alternates: {
      canonical: url,
      languages: { fr: url, 'x-default': url },
    },
  };
}

export default async function TermPage({ params }: PageProps): Promise<React.ReactNode> {
  const { slug } = await params;
  const term = await getTerm(slug);

  if (!term) {
    notFound();
  }

  const relatedTerms = getRelatedTerms(slug);
  const relatedPosts = findPostsForTerm(slug);

  const formattedDate = new Date(term.lastUpdated).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // JSON-LD: DefinedTerm schema
  const definedTermJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description: term.definition,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Lexique GEO',
      url: 'https://coucou-ia.com/lexique',
    },
  };

  // JSON-LD: FAQPage schema (if term has FAQ)
  const faqJsonLd =
    term.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: term.faq.map((item) => ({
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
        name: 'Lexique',
        item: 'https://coucou-ia.com/lexique',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: term.term,
      },
    ],
  };

  return (
    <>
      <JsonLd data={definedTermJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <JsonLd data={breadcrumbJsonLd} />

      <div className="flex min-h-dvh flex-col bg-background">
        <Header variant="blog" />

        {/* Article */}
        <article className="mx-auto w-full max-w-3xl flex-1 px-4 pb-12 pt-28">
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
                <Link href="/lexique" className="hover:text-foreground">
                  Lexique
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{term.term}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight text-balance">
              {term.term}
              {term.termEn && term.termEn !== term.term && (
                <span className="text-muted-foreground font-normal text-2xl ml-3">
                  ({term.termEn})
                </span>
              )}
            </h1>

            {term.aliases.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Aussi appelé : {term.aliases.join(', ')}
              </p>
            )}

            {/* Quick Definition Box */}
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-foreground font-medium text-pretty">{term.definition}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden="true" />
                Mis à jour le {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {term.readingTime}
              </span>
            </div>
          </header>

          {/* Content */}
          <ProseContent content={term.content} />

          {/* FAQ Section */}
          {term.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Questions fréquentes
              </h2>
              <div className="space-y-6">
                {term.faq.map((item, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-muted-foreground text-pretty">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Blog Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Articles associés
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.slice(0, 2).map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Related Terms */}
          {relatedTerms.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Termes associés
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedTerms.map((t) => (
                  <TermCard key={t.slug} term={t} />
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

        <Footer />
      </div>
    </>
  );
}
