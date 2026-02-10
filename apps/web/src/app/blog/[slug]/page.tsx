import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, User } from 'lucide-react';

import { getPost, getAllPostSlugs, getAllPosts } from '@/lib/blog';
import { autoLinkTermsInHtml } from '@/lib/cross-links';
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
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Article non trouvé' };
  }

  const url = `https://coucou-ia.com/blog/${slug}`;

  return {
    title: { absolute: post.title },
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      url,
      images: post.image ? [{ url: post.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
    alternates: {
      canonical: url,
      languages: { fr: url, 'x-default': url },
    },
  };
}

export default async function BlogPostPage({ params }: PageProps): Promise<React.ReactNode> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Auto-link glossary terms in content
  const { html: linkedContent, foundTerms } = autoLinkTermsInHtml(post.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coucou IA',
      url: 'https://coucou-ia.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://coucou-ia.com/blog/${slug}`,
    },
    image: post.image,
    keywords: post.tags.join(', '),
  };

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
        name: 'Blog',
        item: 'https://coucou-ia.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground line-clamp-1">{post.title}</li>
            </ol>
          </nav>

          {/* Meta */}
          <header className="mb-10">
            {post.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="font-display text-4xl font-bold text-foreground leading-tight text-balance">
              {post.title}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground text-pretty">{post.description}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" aria-hidden="true" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" aria-hidden="true" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden="true" />
                {post.readingTime}
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="mb-10 overflow-hidden rounded-xl border border-border">
              <Image
                src={post.image}
                alt={post.imageAlt ?? post.title}
                width={1200}
                height={675}
                className="w-full h-auto object-cover aspect-video"
                priority
              />
            </div>
          )}

          {/* Content */}
          <ProseContent content={linkedContent} />

          {/* Related Lexique Terms */}
          {foundTerms.length > 0 && (
            <section className="mt-16">
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

          {/* Related Posts */}
          {(() => {
            const allPosts = getAllPosts();
            const related = allPosts
              .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
              .slice(0, 2);

            if (related.length === 0) return null;

            return (
              <section className="mt-16">
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6">
                  Articles similaires
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {related.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Footer CTA */}
          <footer className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
            <h2 className="font-display text-xl font-semibold text-foreground text-balance">
              Améliorez votre visibilité dans les IA
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
