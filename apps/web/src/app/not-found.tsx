import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Page non trouvée',
  description: 'La page que vous recherchez n\u2019existe pas ou a été déplacée.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl font-display font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
            Page non trouvée
          </h1>
          <p className="text-muted-foreground mb-8 text-pretty">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 size-4" aria-hidden="true" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 size-4" aria-hidden="true" />
                Lire le blog
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
