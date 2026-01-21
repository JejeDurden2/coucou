'use client';

import { memo } from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import type { Recommendation } from '@coucou-ia/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationCard, SEVERITY_CONFIG } from './recommendation-card';

interface RecommendationsSummaryProps {
  recommendations: Recommendation[];
  maxItems?: number;
  onViewMore?: () => void;
}

export const RecommendationsSummary = memo(function RecommendationsSummary({
  recommendations,
  maxItems = 2,
  onViewMore,
}: RecommendationsSummaryProps) {
  // Sort by severity (critical first, then warning, then info)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const displayedRecommendations = sortedRecommendations.slice(0, maxItems);
  const remainingCount = recommendations.length - maxItems;

  // Count by severity
  const criticalCount = recommendations.filter((r) => r.severity === 'critical').length;
  const warningCount = recommendations.filter((r) => r.severity === 'warning').length;

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-6 text-success" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Aucune recommandation</p>
              <p className="text-xs text-muted-foreground">
                Continuez a scanner pour obtenir des insights personnalises
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <CardTitle className="text-lg font-medium">Recommandations</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_CONFIG.critical.bgClass} ${SEVERITY_CONFIG.critical.colorClass}`}
            >
              {criticalCount} critique{criticalCount > 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_CONFIG.warning.bgClass} ${SEVERITY_CONFIG.warning.colorClass}`}
            >
              {warningCount} attention
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedRecommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} showActionItems={false} compact />
        ))}
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={onViewMore}
            className="w-full flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-3 text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
          >
            +{remainingCount} autre{remainingCount > 1 ? 's' : ''} recommandation
            {remainingCount > 1 ? 's' : ''}
          </button>
        )}
      </CardContent>
    </Card>
  );
});
