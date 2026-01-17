'use client';

import { Check } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlanConfig {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
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
    id: 'SOLO',
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
    id: 'PRO',
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

export default function BillingPage(): React.ReactNode {
  const { user } = useAuth();
  const currentPlan = user?.plan ?? 'FREE';

  function handleUpgrade(_planId: string): void {
    // TODO: Implement Stripe checkout
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Facturation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez votre abonnement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 max-w-4xl">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-lg border bg-card p-6',
                plan.popular ? 'border-primary' : 'border-border',
                isCurrent && 'ring-2 ring-primary/50'
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
                  Populaire
                </span>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">Actuel</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}€</span>
                <span className="text-muted-foreground text-sm">/mois</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" className="w-full" disabled size="sm">
                  Plan actuel
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(plan.id)}
                  size="sm"
                >
                  {plan.price === '0' ? 'Downgrader' : 'Choisir ce plan'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
