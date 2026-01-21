import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { getAllPosts } from '@/lib/blog';
import { PostCard } from '@/components/blog';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Articles et guides sur le GEO (Generative Engine Optimization) et la visibilité de votre marque dans ChatGPT, Claude et les autres IA.',
  openGraph: {
    title: 'Blog | Coucou IA',
    description:
      'Articles et guides sur le GEO (Generative Engine Optimization) et la visibilité de votre marque dans les IA.',
    type: 'website',
  },
};

export default function BlogPage(): React.ReactNode {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="font-display text-4xl font-bold text-foreground">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Guides et articles sur le GEO et la visibilité dans les IA
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Aucun article pour le moment.</p>
            <p className="mt-2 text-sm text-muted-foreground">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
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
