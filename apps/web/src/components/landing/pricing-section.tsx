import Link from 'next/link';
import { Check } from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeatureWithLogos } from '@/components/ui/feature-with-logos';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    ...PLAN_PRICING[Plan.FREE],
    name: 'Free',
    cta: 'Commencer gratuitement',
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
    <section id="pricing" className="py-20 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Tarifs</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Un plan pour chaque besoin
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                plan.popular &&
                  'border-primary ring-1 ring-primary/20 relative order-first md:order-none',
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className="bg-primary text-primary-foreground border-primary shadow-sm"
                    aria-label="Plan recommandé"
                  >
                    Recommandé
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-display font-bold tabular-nums">
                    {plan.price}€
                  </span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground text-pretty">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 text-success shrink-0" aria-hidden="true" />
                      <FeatureWithLogos feature={feature} />
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'} asChild>
                  <Link href="/register">{plan.cta}</Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">{plan.reassurance}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
