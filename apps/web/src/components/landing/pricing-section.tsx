import Link from 'next/link';
import { Check } from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeatureWithLogos } from '@/components/ui/feature-with-logos';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    ...PLAN_PRICING[Plan.FREE],
    name: 'Free',
    cta: 'Analyser ma marque gratuitement',
    popular: false,
    reassurance: 'Commencer sans engagement',
  },
  {
    ...PLAN_PRICING[Plan.SOLO],
    name: 'Solo',
    cta: 'Choisir Solo',
    popular: true,
    reassurance: 'Annulable à tout moment',
  },
  {
    ...PLAN_PRICING[Plan.PRO],
    name: 'Pro',
    cta: 'Choisir Pro',
    popular: false,
    reassurance: 'Support prioritaire inclus',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 px-4 scroll-mt-20 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="mono" className="mb-6">
            Tarifs
          </Badge>
          <h2 className="font-display text-4xl mb-6 text-balance md:text-5xl">
            Un plan pour chaque besoin
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'hover:bg-card-hover transition-colors',
                plan.popular &&
                  'border-primary ring-1 ring-primary/20 relative order-first md:order-none',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className="bg-primary text-primary-foreground border-primary shadow-xs"
                    aria-label="Plan recommandé"
                  >
                    Recommandé
                  </Badge>
                </div>
              )}
              <CardHeader>
                <Badge variant="mono" className="text-xs uppercase tracking-wider w-fit mb-4">
                  {plan.name}
                </Badge>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-4xl tabular-nums font-bold sm:text-5xl md:text-6xl">
                    {plan.price}
                  </span>
                  <span className="font-mono text-xl text-muted-foreground">€/mois</span>
                </div>
                <p className="text-sm text-muted-foreground text-pretty mt-3 leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="size-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="leading-relaxed">
                        <FeatureWithLogos feature={feature} />
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn('w-full', plan.name === 'Free' && 'whitespace-normal')}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
                <p className="font-sans text-xs text-muted-foreground text-center mt-3 uppercase tracking-wide">
                  {plan.reassurance}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
