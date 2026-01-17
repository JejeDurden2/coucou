'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour découvrir',
    features: [
      '1 projet',
      '3 prompts / projet',
      'Scans manuels uniquement',
      'Historique 30 jours',
    ],
  },
  {
    name: 'Solo',
    price: '29',
    description: 'Pour les indépendants',
    features: [
      '5 projets',
      '20 prompts / projet',
      'Scans automatiques hebdo',
      'Historique 6 mois',
      'Support email',
    ],
  },
  {
    name: 'Pro',
    price: '79',
    description: 'Pour les équipes',
    features: [
      '15 projets',
      '50 prompts / projet',
      'Scans automatiques quotidiens',
      'Historique illimité',
      'Support prioritaire',
      'Export CSV / API',
    ],
    popular: true,
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const currentPlan = user?.plan ?? 'FREE';

  const handleUpgrade = (planName: string) => {
    // TODO: Implement Stripe checkout
    console.log('Upgrade to', planName);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Facturation</h1>
      <p className="text-muted-foreground mb-8">
        Gérez votre abonnement et consultez vos factures
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
        {plans.map((plan) => {
          const isCurrent = plan.name.toUpperCase() === currentPlan;
          return (
            <Card
              key={plan.name}
              className={`flex flex-col ${plan.popular ? 'border-cyan-500/50 relative' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Populaire</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrent && <Badge variant="secondary">Actuel</Badge>}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.price === '0' ? 'Downgrader' : 'Choisir'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
