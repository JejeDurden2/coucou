'use client';

import { memo, useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { type EnrichedCompetitor, type Plan } from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { CompetitorCard } from './competitor-ui';

interface CompetitorsContainerProps {
  competitors: EnrichedCompetitor[];
  userPlan: Plan;
}

export const CompetitorsContainer = memo(function CompetitorsContainer({
  competitors,
  userPlan,
}: CompetitorsContainerProps): React.ReactNode {
  // Compute trend counts once
  const trendCounts = useMemo(() => {
    let newCount = 0;
    let upCount = 0;
    let downCount = 0;

    for (const c of competitors) {
      if (c.trend === 'new') newCount++;
      else if (c.trend === 'up') upCount++;
      else if (c.trend === 'down') downCount++;
    }

    return { newCount, upCount, downCount };
  }, [competitors]);

  if (competitors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Trophy className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Aucun concurrent detecte</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Lancez un scan pour decouvrir quels concurrents sont mentionnes par les IA sur vos
                prompts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryStatCard label="Total concurrents" value={competitors.length} />
        <SummaryStatCard
          label="Nouveaux (7j)"
          value={trendCounts.newCount}
          valueClassName="text-primary"
        />
        <SummaryStatCard
          label="En hausse"
          value={trendCounts.upCount}
          valueClassName="text-success"
        />
        <SummaryStatCard
          label="En baisse"
          value={trendCounts.downCount}
          valueClassName="text-destructive"
        />
      </div>

      {/* Full competitors list */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
            <CardTitle className="flex items-center gap-1">
              Tous les concurrents
              <InfoTooltip term="competitor" />
            </CardTitle>
          </div>
          <CardDescription>
            Analyse detaillee des marques concurrentes citees par les IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.name}
                competitor={competitor}
                rank={index + 1}
                userPlan={userPlan}
                showContext
                showStats
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

// Simple stat card for summary section
interface SummaryStatCardProps {
  label: string;
  value: number;
  valueClassName?: string;
}

function SummaryStatCard({ label, value, valueClassName }: SummaryStatCardProps): React.ReactNode {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${valueClassName ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
