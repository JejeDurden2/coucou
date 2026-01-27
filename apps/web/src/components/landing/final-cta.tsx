import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="bg-primary/5 border-t border-primary/10 py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          Découvrez ce que l&apos;IA dit de votre marque
        </h2>
        <p className="text-muted-foreground mb-8 text-pretty">
          Première analyse gratuite, sans carte bancaire.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Analyser ma marque maintenant
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
