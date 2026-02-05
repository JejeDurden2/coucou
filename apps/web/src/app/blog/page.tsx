import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Blog GEO & Recherche IA | Guides et actualités',
  description:
    'Guides pratiques sur le GEO (Generative Engine Optimization), la recherche IA et la visibilité de marque sur ChatGPT et Claude.',
  openGraph: {
    title: 'Blog GEO & Recherche IA : Guides et actualités | Coucou IA',
    description:
      'Guides pratiques sur le GEO, la recherche IA et la visibilité de marque sur ChatGPT et Claude.',
    type: 'website',
  },
  twitter: {
    title: 'Blog GEO & Recherche IA | Coucou IA',
    description: 'Guides pratiques sur le GEO et la visibilité de marque sur ChatGPT et Claude.',
  },
  alternates: {
    canonical: 'https://coucou-ia.com/blog',
  },
};

export default function BlogPage(): React.ReactNode {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header variant="blog" />

      {/* Main */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-28">
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground text-balance">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Guides et articles sur le GEO et la visibilité dans les IA
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-pretty">Aucun article pour le moment.</p>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">Revenez bientôt !</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
