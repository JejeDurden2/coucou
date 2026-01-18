'use client';

import { useState } from 'react';
import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { useCreateCheckout, useCreatePortal } from '@/hooks/use-billing';
import { PlanGrid } from '@/components/plan-card';
import { Button } from '@/components/ui/button';

export default function BillingPage(): React.ReactNode {
  const { user } = useAuth();
  const currentPlan = user?.plan ?? Plan.FREE;
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();

  const handleSelectPlan = (plan: Plan) => {
    setLoadingPlan(plan);

    const baseUrl = window.location.origin;
    createCheckout.mutate(
      {
        plan,
        successUrl: `${baseUrl}/billing?success=true`,
        cancelUrl: `${baseUrl}/billing`,
      },
      {
        onError: () => setLoadingPlan(null),
      },
    );
  };

  const handleManageSubscription = () => {
    const baseUrl = window.location.origin;
    createPortal.mutate(`${baseUrl}/billing`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Facturation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerez votre abonnement
        </p>
      </div>

      <PlanGrid
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
        loadingPlan={loadingPlan}
      />

      {currentPlan !== Plan.FREE && (
        <div className="pt-4 border-t max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Gerer votre abonnement</h3>
              <p className="text-sm text-muted-foreground">
                Modifier votre moyen de paiement, telecharger vos factures ou
                annuler votre abonnement
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={createPortal.isPending}
            >
              {createPortal.isPending ? 'Chargement...' : 'Portail de facturation'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
