'use client';

import { ExternalLink, RotateCcw, Loader2 } from 'lucide-react';
import type { LatestAuditResponseDto } from '@coucou-ia/shared';
import { AuditStatus } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuditReportUrl } from '@/hooks/use-audit';
import {
  getScoreColor,
  getStrokeColor,
  getVerdictColor,
  getFindingBorderColor,
} from './audit-utils';

type AuditCompleted = Extract<
  LatestAuditResponseDto,
  { status: AuditStatus.COMPLETED }
>;

interface AuditDashboardProps {
  projectId: string;
  audit: AuditCompleted;
  onRelaunch: () => void;
  isRelaunching: boolean;
}

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function ScoreCircle({
  score,
  size = 120,
  strokeWidth = 10,
  className,
}: ScoreCircleProps): React.ReactNode {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(getStrokeColor(score), 'transition-all duration-700')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold tabular-nums', getScoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function AuditDashboard({
  projectId,
  audit,
  onRelaunch,
  isRelaunching,
}: AuditDashboardProps): React.ReactNode {
  const { data: reportData, isLoading: isReportLoading } = useAuditReportUrl(
    projectId,
    audit.auditId,
    true,
  );
  const reportUrl = reportData?.url;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-balance">Résultats de l&apos;audit GEO</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit complété le {formatDate(audit.completedAt)}
        </p>
      </div>

      {/* Score section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* GEO Score circle */}
            <div className="flex flex-col items-center gap-2">
              <ScoreCircle score={audit.geoScore ?? 0} size={140} strokeWidth={12} />
              <p className="text-sm font-medium text-muted-foreground">Score GEO</p>
            </div>

            {/* Verdict + external presence */}
            <div className="flex flex-col gap-4 items-center sm:items-start">
              {audit.verdict && (
                <Badge
                  className={cn(
                    'text-sm px-3 py-1 capitalize',
                    getVerdictColor(audit.verdict),
                  )}
                >
                  {audit.verdict}
                </Badge>
              )}

              {audit.externalPresenceScore !== null && (
                <div className="flex items-center gap-3">
                  <ScoreCircle
                    score={audit.externalPresenceScore}
                    size={48}
                    strokeWidth={5}
                  />
                  <span className="text-sm text-muted-foreground">Présence externe</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top findings */}
      {audit.topFindings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {audit.topFindings.slice(0, 3).map((finding, index) => (
            <Card
              key={finding}
              className={cn('border-l-4', getFindingBorderColor(index))}
            >
              <CardContent className="py-4">
                <p className="text-sm">{finding}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Counters row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {audit.totalActions !== null && (
          <span className="tabular-nums font-medium text-foreground">
            {audit.totalActions} actions
          </span>
        )}
        {audit.totalActions !== null && audit.pagesAnalyzedClient !== null && (
          <span aria-hidden="true">•</span>
        )}
        {audit.pagesAnalyzedClient !== null && (
          <span className="tabular-nums font-medium text-foreground">
            {audit.pagesAnalyzedClient} pages
          </span>
        )}
        {audit.pagesAnalyzedClient !== null && audit.competitorsAnalyzed.length > 0 && (
          <span aria-hidden="true">•</span>
        )}
        {audit.competitorsAnalyzed.length > 0 && (
          <span className="tabular-nums font-medium text-foreground">
            {audit.competitorsAnalyzed.length} concurrents
          </span>
        )}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" disabled={isReportLoading || !reportUrl} asChild={!!reportUrl}>
          {reportUrl ? (
            <a href={reportUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4 mr-2" />
              Voir le rapport PDF
            </a>
          ) : (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Chargement...
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={onRelaunch}
          disabled={isRelaunching}
        >
          <RotateCcw className="size-4 mr-2" />
          {isRelaunching ? 'Redirection...' : 'Relancer un audit'}
        </Button>
      </div>
    </div>
  );
}
