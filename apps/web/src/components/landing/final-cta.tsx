import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="bg-card border-t border-border py-20 px-4 md:py-24">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl mb-6 text-balance md:text-5xl">
          Découvrez ce que l&apos;IA dit de votre marque
        </h2>
        <p className="text-lg text-muted-foreground mb-10 text-pretty leading-relaxed">
          Première analyse gratuite, sans carte bancaire.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Analyser ma marque gratuitement
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
