'use client';

import { useState } from 'react';
import { Search, BarChart3, Globe, FileText } from 'lucide-react';
import type { DashboardStats } from '@coucou-ia/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuditCheckoutDialog } from './audit-checkout-dialog';
import { AUDIT_PRICE_LABEL } from './audit-utils';

const VALUE_PROPS = [
  {
    icon: Search,
    title: 'Analyse complète de votre site',
    description: 'Structure, contenu, technique : chaque page est auditée pour la visibilité IA.',
  },
  {
    icon: Globe,
    title: 'Présence externe vérifiée',
    description: 'Wikipedia, Trustpilot, LinkedIn… vérification de votre empreinte numérique.',
  },
  {
    icon: BarChart3,
    title: 'Benchmark détaillé de vos concurrents',
    description: 'Comparaison directe sur les critères GEO avec vos concurrents détectés.',
  },
  {
    icon: FileText,
    title: 'Plan d\'action + rapport PDF',
    description: 'Plan d\'action priorisé et rapport PDF professionnel téléchargeable.',
  },
] as const;

interface AuditEmptyStateProps {
  stats: DashboardStats | undefined;
  brandName: string;
  domain: string;
  onLaunchAudit: () => void;
  isLaunching: boolean;
}

export function AuditEmptyState({ stats, brandName, domain, onLaunchAudit, isLaunching }: AuditEmptyStateProps): React.ReactNode {
  const [dialogOpen, setDialogOpen] = useState(false);
  const citationRate = stats?.globalScore ?? 0;
  const competitorCount = stats?.topCompetitors?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Audit GEO complet</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Obtenez une analyse approfondie de votre visibilité sur les moteurs de recherche IA.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card className="flex-1 min-w-[140px]">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Taux de citation actuel</p>
            <p className="text-2xl font-semibold tabular-nums">{citationRate}%</p>
          </CardContent>
        </Card>
        <Card className="flex-1 min-w-[140px]">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Concurrents détectés</p>
            <p className="text-2xl font-semibold tabular-nums">{competitorCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {VALUE_PROPS.map((prop) => (
          <Card key={prop.title}>
            <CardContent className="flex gap-4 pt-4 pb-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <prop.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{prop.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{prop.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        size="lg"
        onClick={() => setDialogOpen(true)}
        className="w-full sm:w-auto"
      >
        {`Lancer l'audit — ${AUDIT_PRICE_LABEL}`}
      </Button>

      <AuditCheckoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        brandName={brandName}
        domain={domain}
        competitors={(stats?.topCompetitors ?? []).slice(0, 3).map((c) => c.name)}
        onConfirm={onLaunchAudit}
        isPending={isLaunching}
        hasScans={(stats?.totalScans ?? 0) > 0}
      />
    </div>
  );
}
