import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Scale, User } from 'lucide-react';

import {
  getComparison,
  getAllComparisonSlugs,
  getRelatedComparisons,
  getCategoryLabel,
} from '@/lib/comparatif';
import { getAllPosts } from '@/lib/blog';
import { autoLinkTermsInHtml } from '@/lib/cross-links';
import { ComparisonCard } from '@/components/comparatif';
import { PostCard } from '@/components/blog';
import { TermCard } from '@/components/lexique';
import { ProseContent } from '@/components/ui/prose-content';
import { JsonLd } from '@/components/seo/json-ld';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = getAllComparisonSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = await getComparison(slug);

  if (!comparison) {
    return { title: 'Page non trouvée' };
  }

  const url = `https://coucou-ia.com/comparatif/${slug}`;

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    authors: [{ name: comparison.author }],
    keywords: [
      comparison.itemA,
      comparison.itemB,
      `${comparison.itemA} vs ${comparison.itemB}`,
      'GEO',
      'comparatif',
      'visibilité IA',
    ],
    openGraph: {
      title: comparison.metaTitle,
      description: comparison.metaDescription,
      type: 'article',
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: comparison.metaTitle,
      description: comparison.metaDescription,
    },
    alternates: {
      canonical: url,
      languages: { fr: url, 'x-default': url },
    },
  };
}

export default async function ComparisonPage({ params }: PageProps): Promise<React.ReactNode> {
  const { slug } = await params;
  const comparison = await getComparison(slug);

  if (!comparison) {
    notFound();
  }

  const relatedComparisons = getRelatedComparisons(slug);

  // Auto-link glossary terms in content
  const { html: linkedContent, foundTerms } = autoLinkTermsInHtml(comparison.content);

  // Find related blog posts by matching itemA/itemB in tags (case-insensitive)
  const allPosts = getAllPosts();
  const searchTerms = [comparison.itemA.toLowerCase(), comparison.itemB.toLowerCase()];
  const relatedPosts = allPosts
    .filter((p) => p.tags.some((t) => searchTerms.includes(t.toLowerCase())))
    .slice(0, 2);

  const formattedDate = new Date(comparison.lastUpdated).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // JSON-LD: Article schema
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comparison.metaTitle,
    description: comparison.metaDescription,
    author: {
      '@type': 'Person',
      name: comparison.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coucou IA',
      url: 'https://coucou-ia.com',
    },
    datePublished: comparison.lastUpdated,
    dateModified: comparison.lastUpdated,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coucou-ia.com/comparatif/${slug}`,
    },
  };

  // JSON-LD: FAQPage schema (if comparison has FAQ)
  const faqJsonLd =
    comparison.faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: comparison.faq.map((item) => ({
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
        name: 'Comparatifs',
        item: 'https://coucou-ia.com/comparatif',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: comparison.title,
      },
    ],
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
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
                <Link href="/comparatif" className="hover:text-foreground">
                  Comparatifs
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{comparison.title}</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-10">
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Scale className="size-3" aria-hidden="true" />
                {getCategoryLabel(comparison.category)}
              </span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight text-balance">
              {comparison.metaTitle}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" aria-hidden="true" />
                {comparison.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden="true" />
                Mis à jour le {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {comparison.readingTime}
              </span>
            </div>
          </header>

          {/* Verdict Box */}
          {comparison.verdict && (
            <section className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Scale className="size-5 text-primary" aria-hidden="true" />
                Notre verdict
              </h2>
              <p className="text-muted-foreground leading-relaxed">{comparison.verdict}</p>
            </section>
          )}

          {/* Main Content (auto-linked with glossary terms) */}
          <ProseContent content={linkedContent} />

          {/* FAQ Section */}
          {comparison.faq.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Questions fréquentes
              </h2>
              <div className="space-y-6">
                {comparison.faq.map((item, index) => (
                  <div key={index} className="rounded-lg border border-border p-4">
                    <h3 className="font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-muted-foreground text-pretty">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Comparisons */}
          {relatedComparisons.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Comparatifs associés
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedComparisons.map((c) => (
                  <ComparisonCard key={c.slug} comparison={c} />
                ))}
              </div>
            </section>
          )}

          {/* Related Lexique Terms (from auto-linking) */}
          {foundTerms.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Termes du lexique
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {foundTerms.slice(0, 4).map((term) => (
                  <TermCard key={term.slug} term={term} />
                ))}
              </div>
            </section>
          )}

          {/* Related Blog Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                Articles similaires
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {relatedPosts.map((p) => (
                  <PostCard key={p.slug} post={p} />
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
