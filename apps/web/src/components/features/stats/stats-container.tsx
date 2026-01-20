'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';
import { useHistoricalStats } from '@/hooks/use-historical-stats';
import { DateRangePicker, type DatePreset } from './date-range-picker';
import { CitationRateChart } from './citation-rate-chart';
import { RankTrendChart } from './rank-trend-chart';
import { ModelBreakdownChart } from './model-breakdown-chart';
import { CompetitorChart } from './competitor-chart';
import { Badge } from '@/components/ui/badge';

interface StatsContainerProps {
  projectId: string;
  userPlan: Plan;
}

function getDateRange(preset: DatePreset): { start: string; end: string } | undefined {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  if (preset === 'all') {
    return undefined; // Let API determine full range
  }

  const daysMap: Record<Exclude<DatePreset, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[preset];
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: start.toISOString().split('T')[0],
    end,
  };
}

export function StatsContainer({ projectId, userPlan }: StatsContainerProps) {
  const defaultPreset: DatePreset = userPlan === Plan.SOLO ? '30d' : '30d';
  const [preset, setPreset] = useState<DatePreset>(defaultPreset);

  const dateRange = useMemo(() => getDateRange(preset), [preset]);
  const { data, isLoading, error } = useHistoricalStats(projectId, dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="ml-2 text-muted-foreground">Chargement des statistiques...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
        <span className="ml-2 text-destructive">Erreur lors du chargement des statistiques</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date picker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Historique</h2>
          {data.planLimit.isLimited && (
            <Badge variant="muted" className="text-xs">
              {data.planLimit.maxDays} jours max
            </Badge>
          )}
        </div>
        <DateRangePicker value={preset} onChange={setPreset} userPlan={userPlan} />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CitationRateChart data={data.citationRate} aggregation={data.aggregation} />
        <RankTrendChart data={data.averageRank} aggregation={data.aggregation} />
        <ModelBreakdownChart data={data.rankByModel} aggregation={data.aggregation} />
        <CompetitorChart data={data.competitorTrends} aggregation={data.aggregation} />
      </div>
    </div>
  );
}
