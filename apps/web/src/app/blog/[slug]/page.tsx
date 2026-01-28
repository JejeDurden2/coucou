import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

import { getPost, getAllPostSlugs } from '@/lib/blog';
import { PostContent } from '@/components/blog';
import { Logo } from '@/components/ui/logo';

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
    title: post.title,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                href="/blog"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Tous les articles
              </Link>
            </div>
          </div>
        </header>

        {/* Article */}
        <article className="mx-auto max-w-3xl px-4 py-12">
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
                alt={post.title}
                width={1200}
                height={675}
                className="w-full h-auto object-cover aspect-video"
                priority
              />
            </div>
          )}

          {/* Content */}
          <PostContent content={post.content} />

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
