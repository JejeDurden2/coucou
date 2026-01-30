import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardMockup } from '@/components/landing/dashboard-mockup';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 px-4 overflow-hidden lg:pt-32">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <Badge className="mb-6" variant="outline">
              <Sparkles className="mr-1 size-3" aria-hidden="true" />
              Nouveau : Support Claude
            </Badge>

            <h1 className="font-display text-4xl font-bold mb-6 text-balance md:text-5xl lg:text-6xl">
              L&apos;outil <span className="text-primary">GEO</span> pour surveiller votre
              visibilité IA
            </h1>

            <p className="text-lg text-muted-foreground mx-auto mb-8 max-w-lg text-pretty lg:mx-0 lg:text-xl">
              Mesurez si <span className="text-foreground font-medium">ChatGPT</span> et{' '}
              <span className="text-foreground font-medium">Claude</span> recommandent votre marque
              — ou vos concurrents.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start mb-6">
              <Button size="lg" asChild>
                <Link href="/register">
                  Analyser ma marque gratuitement
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Sans carte bancaire · Résultat en 2 minutes · RGPD compliant
            </p>
          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
