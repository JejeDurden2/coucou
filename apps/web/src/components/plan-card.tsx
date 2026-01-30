'use client';

import { Check } from 'lucide-react';
import { Plan, PLAN_PRICING } from '@coucou-ia/shared';

import { Button } from '@/components/ui/button';
import { FeatureWithLogos } from '@/components/ui/feature-with-logos';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: Plan;
  isCurrent?: boolean;
  onSelect?: (plan: Plan) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'compact';
}

export function PlanCard({
  plan,
  isCurrent = false,
  onSelect,
  disabled = false,
  loading = false,
  variant = 'default',
}: PlanCardProps): React.ReactNode {
  const pricing = PLAN_PRICING[plan];
  const planName = plan.charAt(0) + plan.slice(1).toLowerCase();

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-lg border bg-card',
        variant === 'compact' ? 'p-4' : 'p-6',
        pricing.isPopular ? 'border-primary' : 'border-border',
        isCurrent && 'ring-2 ring-primary/50',
      )}
    >
      {pricing.isPopular && (
        <span className="absolute -top-2.5 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded">
          Populaire
        </span>
      )}

      <div className={variant === 'compact' ? 'mb-3' : 'mb-4'}>
        <div className="flex items-center justify-between">
          <h3 className="text-balance font-semibold">{planName}</h3>
          {isCurrent && <span className="text-xs bg-muted px-2 py-0.5 rounded">Actuel</span>}
        </div>
        <p className="text-pretty text-sm text-muted-foreground">{pricing.description}</p>
      </div>

      <div className={variant === 'compact' ? 'mb-3' : 'mb-4'}>
        <span className="text-3xl font-bold tabular-nums">{pricing.price}€</span>
        <span className="text-muted-foreground text-sm">/{pricing.period}</span>
      </div>

      <ul className={cn('space-y-2 flex-1', variant === 'compact' ? 'mb-4' : 'mb-6')}>
        {pricing.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <FeatureWithLogos feature={feature} />
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
          variant={pricing.isPopular ? 'default' : 'outline'}
          onClick={() => onSelect?.(plan)}
          disabled={disabled || loading}
          size="sm"
        >
          {loading ? 'Chargement...' : pricing.price === 0 ? 'Choisir Free' : 'Choisir ce plan'}
        </Button>
      )}
    </div>
  );
}

interface PlanGridProps {
  currentPlan?: Plan;
  onSelectPlan: (plan: Plan) => void;
  loadingPlan?: Plan | null;
  variant?: 'default' | 'compact';
}

export function PlanGrid({
  currentPlan,
  onSelectPlan,
  loadingPlan,
  variant = 'default',
}: PlanGridProps): React.ReactNode {
  const plans: Plan[] = [Plan.FREE, Plan.SOLO, Plan.PRO];

  return (
    <div className="grid gap-4 md:grid-cols-3 max-w-4xl">
      {plans.map((plan) => (
        <PlanCard
          key={plan}
          plan={plan}
          isCurrent={plan === currentPlan}
          onSelect={onSelectPlan}
          loading={loadingPlan === plan}
          disabled={loadingPlan !== null && loadingPlan !== plan}
          variant={variant}
        />
      ))}
    </div>
  );
}
