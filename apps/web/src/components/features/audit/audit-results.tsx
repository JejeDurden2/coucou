'use client';

import { Download, ArrowRight, AlertTriangle } from 'lucide-react';
import { AuditStatus, type AuditResult } from '@coucou-ia/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AuditScoreOverview } from './audit-score-overview';
import { AuditBenchmarkSection } from './audit-benchmark';
import { AuditStrengthsWeaknesses } from './audit-strengths-weaknesses';
import { AuditIssues } from './audit-issues';
import { AuditActionPlan } from './audit-action-plan';

interface AuditResultsProps {
  status: AuditStatus.COMPLETED | AuditStatus.PARTIAL;
  result: AuditResult;
  reportUrl: string | null;
  brandName: string;
}

export function AuditResults({ status, result, reportUrl, brandName }: AuditResultsProps): React.ReactNode {
  const totalActions =
    result.actionPlan.quickWins.length +
    result.actionPlan.shortTerm.length +
    result.actionPlan.mediumTerm.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Résultats de l'audit GEO</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {result.meta.pagesAnalyzedClient} pages analysées en {Math.round(result.meta.executionTimeSeconds / 60)} min
          </p>
        </div>
        {reportUrl && (
          <Button variant="outline" asChild>
            <a href={reportUrl} target="_blank" rel="noopener noreferrer">
              <Download className="size-4 mr-2" />
              Télécharger le PDF
            </a>
          </Button>
        )}
      </div>

      {/* Partial disclaimer */}
      {status === AuditStatus.PARTIAL && (
        <Card className="border-yellow-500/30">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="size-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-yellow-500">
              Certains résultats sont incomplets. Les données disponibles sont affichées ci-dessous.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Score overview */}
      <Card>
        <CardContent className="pt-6">
          <AuditScoreOverview geoScore={result.geoScore} />
        </CardContent>
      </Card>

      {/* Benchmark */}
      {result.competitorBenchmark.length > 0 && (
        <AuditBenchmarkSection
          competitors={result.competitorBenchmark}
          clientScore={result.geoScore.overall}
          clientName={brandName}
        />
      )}

      {/* Strengths & Weaknesses */}
      <AuditStrengthsWeaknesses
        strengths={result.geoScore.mainStrengths}
        weaknesses={result.geoScore.mainWeaknesses}
      />

      {/* Issues */}
      <AuditIssues pages={result.siteAudit.pagesAnalyzed} />

      {/* Action Plan */}
      <AuditActionPlan
        quickWins={result.actionPlan.quickWins}
        shortTerm={result.actionPlan.shortTerm}
        mediumTerm={result.actionPlan.mediumTerm}
      />

      {/* Upsell CTA */}
      <Card className="border-primary/30">
        <CardContent className="flex flex-col items-center text-center py-8 space-y-3">
          <h3 className="text-lg font-semibold text-balance">Passez à l'exécution</h3>
          <p className="text-sm text-muted-foreground max-w-md text-pretty">
            {totalActions} actions identifiées pour améliorer votre visibilité IA.
            Besoin d'aide pour les mettre en œuvre ?
          </p>
          <Button asChild>
            <a href="mailto:support@coucou-ia.com">
              Nous contacter
              <ArrowRight className="size-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
