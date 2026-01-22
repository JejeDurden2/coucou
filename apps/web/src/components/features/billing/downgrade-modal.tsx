'use client';

import { Plan, PLAN_LIMITS } from '@coucou-ia/shared';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDateFr } from '@/lib/utils';

interface DowngradeModalProps {
  currentPlan: Plan;
  currentPeriodEnd: string | null;
  onConfirm: () => void;
  isPending: boolean;
}

function formatPlanName(plan: Plan): string {
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

export function DowngradeModal({
  currentPlan,
  currentPeriodEnd,
  onConfirm,
  isPending,
}: DowngradeModalProps): React.ReactNode {
  const currentLimits = PLAN_LIMITS[currentPlan];
  const freeLimits = PLAN_LIMITS[Plan.FREE];
  const planName = formatPlanName(currentPlan);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {"Annuler l'abonnement"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Annuler votre abonnement {planName} ?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                {"Vous conserverez l'accès à toutes les fonctionnalités jusqu'au "}
                <strong>{currentPeriodEnd ? formatDateFr(currentPeriodEnd) : 'fin de période'}</strong>.
              </p>

              <div className="rounded-lg border p-4 space-y-3">
                <p className="font-medium text-foreground">
                  Ce que vous perdrez avec le plan Gratuit :
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Projets</span>
                    <span>
                      <span className="line-through text-muted-foreground mr-2">
                        {currentLimits.projects}
                      </span>
                      → {freeLimits.projects}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Prompts par projet</span>
                    <span>
                      <span className="line-through text-muted-foreground mr-2">
                        {currentLimits.promptsPerProject}
                      </span>
                      → {freeLimits.promptsPerProject}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Fréquence de scan</span>
                    <span>
                      <span className="line-through text-muted-foreground mr-2">
                        {currentLimits.scanFrequency === 'daily' ? 'Quotidien' : 'Hebdomadaire'}
                      </span>
                      → Hebdomadaire
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Annulation...' : "Confirmer l'annulation"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
