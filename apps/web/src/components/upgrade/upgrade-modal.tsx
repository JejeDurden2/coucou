'use client';

import { memo, useEffect } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Plan, PLAN_PRICING, PLAN_LIMITS } from '@coucou-ia/shared';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateCheckout } from '@/hooks/use-billing';
import { trackUpgradeEvent } from '@/hooks/use-upgrade';
import { UPGRADE_FEATURES, type UpgradeFeature } from './upgrade-config';

interface UpgradeModalProps {
  feature: UpgradeFeature | null;
  onOpenChange: (open: boolean) => void;
}

const soloPrice = PLAN_PRICING[Plan.SOLO].price;
const soloLimits = PLAN_LIMITS[Plan.SOLO];
const freeLimits = PLAN_LIMITS[Plan.FREE];

const PLAN_COMPARISON = [
  {
    label: 'Marques',
    free: `${freeLimits.projects}`,
    solo: `${soloLimits.projects}`,
  },
  {
    label: 'Prompts/marque',
    free: `${freeLimits.promptsPerProject}`,
    solo: `${soloLimits.promptsPerProject}`,
  },
  {
    label: 'Modèles IA',
    free: '1',
    solo: '3',
  },
  {
    label: 'Analyse sentiment',
    free: null,
    solo: 'Incluse',
  },
  {
    label: 'Historique',
    free: `${freeLimits.retentionDays}j`,
    solo: `${soloLimits.retentionDays}j`,
  },
];

export const UpgradeModal = memo(function UpgradeModal({
  feature,
  onOpenChange,
}: UpgradeModalProps) {
  const open = feature !== null;
  const config = feature ? UPGRADE_FEATURES[feature] : null;
  const checkout = useCreateCheckout();

  useEffect(() => {
    if (feature) {
      trackUpgradeEvent('modal_open', feature);
    }
  }, [feature]);

  function handleUpgrade(): void {
    if (!feature) return;
    trackUpgradeEvent('cta_click', feature);
    trackUpgradeEvent('checkout_start', feature);
    checkout.mutate({
      plan: Plan.SOLO,
      successUrl: window.location.href,
      cancelUrl: window.location.href,
    });
  }

  function handleClose(): void {
    if (feature) {
      trackUpgradeEvent('modal_close', feature);
    }
    onOpenChange(false);
  }

  if (!config) return null;

  const FeatureIcon = config.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <FeatureIcon className="size-6 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center">
            Débloquez {config.title.toLowerCase().startsWith('analyse') ? "l'" : 'les '}
            {config.title.toLowerCase()}
          </DialogTitle>
          <DialogDescription className="text-center">{config.description}</DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <ul className="space-y-2 my-2" role="list">
          {config.benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <Check className="size-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-pretty">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Plan comparison mini-table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase" />
                <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                  Free
                </th>
                <th className="text-center px-3 py-2 text-xs font-medium text-primary uppercase">
                  <span className="flex items-center justify-center gap-1">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Solo
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">{row.label}</td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{row.free ?? '—'}</td>
                  <td className="px-3 py-2 text-center font-medium">{row.solo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={handleUpgrade}
            disabled={checkout.isPending}
            className="w-full"
            size="lg"
          >
            {checkout.isPending ? (
              'Redirection…'
            ) : (
              <>
                Passer à Solo — {soloPrice}€/mois
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/billing">Comparer tous les plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
