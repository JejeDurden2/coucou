import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-20 px-4 overflow-hidden md:pt-28 md:pb-28">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="font-display text-4xl leading-[0.95] mb-4 md:text-5xl lg:text-6xl">
              <span className="block">
                L&apos;outil <span className="text-secondary-accent">GEO</span>
              </span>
              <span className="block mt-1">pour analyser</span>
              <span className="block mt-1">votre visibilité IA</span>
            </h1>

            <p className="font-sans text-base leading-relaxed text-muted-foreground mb-6 max-w-xl md:text-lg">
              Surveillez votre présence dans ChatGPT et Claude. Analyses automatisées.
              Recommandations actionnables.
            </p>

            <div className="flex flex-col items-start gap-4 sm:flex-row mb-6">
              <Button size="lg" asChild>
                <Link href="/register">
                  Analyser ma marque gratuitement
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
              Sans CB · 2 min · RGPD
            </p>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
