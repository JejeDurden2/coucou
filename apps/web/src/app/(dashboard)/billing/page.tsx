'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '0',
    description: 'Pour découvrir',
    features: ['1 projet', '3 prompts', 'Scans manuels', 'Rétention 30 jours'],
    current: true,
  },
  {
    name: 'Solo',
    price: '39',
    description: 'Pour les indépendants',
    features: [
      '3 projets',
      '15 prompts / projet',
      'Scans hebdomadaires',
      'Rétention 1 an',
      'Support email',
    ],
    current: false,
  },
  {
    name: 'Pro',
    price: '99',
    description: 'Pour les PME',
    features: [
      '10 projets',
      '50 prompts / projet',
      'Scans hebdomadaires',
      'Rétention 1 an',
      'Support prioritaire',
      'Export des données',
    ],
    current: false,
    popular: true,
  },
  {
    name: 'Agency',
    price: '249',
    description: 'Pour les agences',
    features: [
      '25 projets',
      '150 prompts / projet',
      'Scans quotidiens',
      'Rétention 1 an',
      'Support dédié',
      'API access',
      'White label',
    ],
    current: false,
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
      <p className="text-muted-foreground mb-6">
        Gérez votre abonnement et consultez vos factures
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = plan.name.toUpperCase() === currentPlan;
          return (
            <Card
              key={plan.name}
              className={plan.popular ? 'border-cyan-500/50 relative' : ''}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Populaire</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {isCurrent && (
                    <Badge variant="secondary">Actuel</Badge>
                  )}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-cyan-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
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
                    {plan.price === '0' ? 'Downgrader' : 'Upgrader'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
