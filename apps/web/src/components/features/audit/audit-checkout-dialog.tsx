'use client';

import { Check, Clock, Globe, Users, Loader2, AlertCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AUDIT_PRICE_LABEL } from './audit-utils';

const VALUE_ITEMS = [
  'Analyse complète de votre site pour la visibilité IA',
  'Benchmark concurrentiel détaillé',
  'Plan d\'action priorisé (quick wins, court et moyen terme)',
  'Rapport PDF téléchargeable',
] as const;

interface AuditCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandName: string;
  domain: string;
  competitors: string[];
  onConfirm: () => void;
  isPending: boolean;
  hasScans: boolean;
}

export function AuditCheckoutDialog({
  open,
  onOpenChange,
  brandName,
  domain,
  competitors,
  onConfirm,
  isPending,
  hasScans,
}: AuditCheckoutDialogProps): React.ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lancer l&apos;audit GEO pour {brandName}</DialogTitle>
          <DialogDescription>
            Confirmez les détails de votre audit avant le paiement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <p className="text-sm font-medium">Ce que vous recevez</p>
            <ul className="space-y-2">
              {VALUE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Délai :</span>
              <span className="font-medium">Résultats sous 5 à 10 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Domaine analysé :</span>
              <span className="font-medium truncate">{domain}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-muted-foreground">Concurrents analysés :</span>
              <span className="font-medium">
                {competitors.length > 0
                  ? competitors.join(', ')
                  : 'Aucun concurrent détecté'}
              </span>
            </div>
          </div>

          <p className="text-lg font-semibold text-right">{AUDIT_PRICE_LABEL}</p>
        </div>

        {!hasScans && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            Lancez d&apos;abord un scan pour détecter vos concurrents.
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Annuler
          </Button>
          {hasScans ? (
            <Button onClick={onConfirm} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                  Redirection…
                </>
              ) : (
                `Payer ${AUDIT_PRICE_LABEL}`
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
