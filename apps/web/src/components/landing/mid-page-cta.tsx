import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MidPageCTA() {
  return (
    <section className="py-20 px-4 bg-card border-y border-border md:py-24">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl mb-6 text-balance md:text-5xl">
          Prêt à découvrir ce que l&apos;IA dit de vous ?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 text-pretty leading-relaxed">
          Première analyse gratuite, sans engagement.
        </p>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/register">
            Analyser ma marque gratuitement
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
