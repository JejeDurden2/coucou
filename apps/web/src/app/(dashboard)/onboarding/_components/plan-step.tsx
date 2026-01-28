'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { useCreateCheckout } from '@/hooks/use-billing';
import { PlanGrid } from '@/components/plan-card';

interface PlanStepProps {
  onNext: () => void;
}

export function PlanStep({ onNext }: PlanStepProps): React.ReactNode {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const createCheckout = useCreateCheckout();

  function handleSelectPlan(plan: Plan): void {
    setLoadingPlan(plan);

    if (plan === Plan.FREE) {
      onNext();
      setLoadingPlan(null);
    } else {
      const baseUrl = window.location.origin;
      createCheckout.mutate({
        plan,
        successUrl: `${baseUrl}/onboarding?step=brand`,
        cancelUrl: `${baseUrl}/onboarding`,
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="size-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-balance">Bienvenue sur Coucou IA</h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Choisissez le plan qui correspond à vos besoins
        </p>
      </div>

      <PlanGrid onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} />

      <p className="text-center text-sm text-muted-foreground">
        Vous pouvez changer de plan à tout moment depuis les paramètres.
      </p>
    </div>
  );
}
