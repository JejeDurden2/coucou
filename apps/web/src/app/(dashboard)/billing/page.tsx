'use client';

import { useState } from 'react';

import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import {
  useCreateCheckout,
  useCreatePortal,
  useSubscription,
  useDowngrade,
  useCancelDowngrade,
} from '@/hooks/use-billing';
import { PlanGrid } from '@/components/plan-card';
import { Button } from '@/components/ui/button';
import {
  SubscriptionStatusBadge,
  DowngradeModal,
  CancelDowngradeButton,
} from '@/components/features/billing';

export default function BillingPage(): React.ReactNode {
  const { user } = useAuth();
  const currentPlan = user?.plan ?? Plan.FREE;
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();
  const { data: subscription } = useSubscription();
  const downgrade = useDowngrade();
  const cancelDowngrade = useCancelDowngrade();

  function handleSelectPlan(plan: Plan): void {
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
  }

  function handleManageSubscription(): void {
    const baseUrl = window.location.origin;
    createPortal.mutate(`${baseUrl}/billing`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold">Facturation</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez votre abonnement</p>
        </div>
        {subscription && (
          <SubscriptionStatusBadge
            status={subscription.status}
            cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            currentPeriodEnd={subscription.currentPeriodEnd}
          />
        )}
      </div>

      <PlanGrid
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
        loadingPlan={loadingPlan}
      />

      {currentPlan !== Plan.FREE && (
        <div className="pt-4 border-t max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Gérer votre abonnement</h3>
              <p className="text-sm text-muted-foreground">
                Modifier votre moyen de paiement ou télécharger vos factures
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

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">
                {subscription?.cancelAtPeriodEnd ? "Réactiver l'abonnement" : "Annuler l'abonnement"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {subscription?.cancelAtPeriodEnd
                  ? "Votre abonnement est programmé pour s'arrêter. Vous pouvez le réactiver."
                  : "Vous conserverez l'accès jusqu'à la fin de votre période de facturation."}
              </p>
            </div>
            {subscription?.cancelAtPeriodEnd ? (
              <CancelDowngradeButton
                onCancel={() => cancelDowngrade.mutate()}
                isPending={cancelDowngrade.isPending}
              />
            ) : (
              <DowngradeModal
                currentPlan={currentPlan}
                currentPeriodEnd={subscription?.currentPeriodEnd ?? null}
                onConfirm={() => downgrade.mutate()}
                isPending={downgrade.isPending}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
