'use client';

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import { type DashboardStats, type EnrichedCompetitor, type Plan } from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { DashboardCompetitorCard } from '@/components/dashboard/competitor-card';
import { CompetitorsBentoSection } from './competitors-bento-section';

interface CompetitorsContainerProps {
  competitors: EnrichedCompetitor[];
  userPlan: Plan;
  stats?: DashboardStats;
}

export const CompetitorsContainer = memo(function CompetitorsContainer({
  competitors,
  userPlan,
  stats,
}: CompetitorsContainerProps): React.ReactNode {
  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Trophy className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-balance">Aucun concurrent identifié</h3>
              <p className="text-sm text-muted-foreground max-w-md text-pretty">
                Lancez une analyse pour découvrir quels concurrents sont mentionnés par les IA sur
                vos requêtes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <CompetitorsBentoSection
        competitors={competitors}
        userAverageRank={stats?.averageRank ?? null}
        averageRankTrend={stats?.trend}
        averageRankSparkline={stats?.trends?.averageRank}
      />

      {/* Full competitors list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" aria-hidden="true" />
            <CardTitle className="flex items-center gap-1">
              Tous les concurrents
              <InfoTooltip term="competitor" />
            </CardTitle>
          </div>
          <CardDescription>
            Analyse détaillée des marques concurrentes citées par les IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor, index) => (
              <DashboardCompetitorCard
                key={competitor.name}
                competitor={competitor}
                rank={index + 1}
                userPlan={userPlan}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
