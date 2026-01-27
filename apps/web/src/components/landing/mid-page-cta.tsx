import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MidPageCTA() {
  return (
    <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          Prêt à découvrir ce que l&apos;IA dit de vous ?
        </h2>
        <p className="text-muted-foreground mb-8 text-pretty">
          Première analyse gratuite, sans engagement.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Commencer l&apos;analyse gratuite
            <ArrowRight className="ml-2 size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
