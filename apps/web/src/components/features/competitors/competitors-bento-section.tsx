'use client';

import { useMemo } from 'react';
import { Users, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { EnrichedCompetitor, Trend, TimeSeriesPoint } from '@coucou-ia/shared';

import { BentoGrid, BentoItem } from '@/components/dashboard/bento-grid';
import { StatCard } from '@/components/features/dashboard/stat-card';
import { UserRankingCard } from './user-ranking-card';

interface CompetitorsBentoSectionProps {
  competitors: EnrichedCompetitor[];
  userAverageRank: number | null;
  averageRankTrend?: Trend;
  averageRankSparkline?: TimeSeriesPoint[];
}

export function CompetitorsBentoSection({
  competitors,
  userAverageRank,
  averageRankTrend,
  averageRankSparkline,
}: CompetitorsBentoSectionProps): React.ReactNode {
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

  const { userRank, totalBrands } = useMemo(() => {
    const total = competitors.length + 1;

    if (userAverageRank === null) {
      return { userRank: null, totalBrands: total };
    }

    const betterCount = competitors.filter(
      (c) => c.averagePosition !== null && c.averagePosition < userAverageRank,
    ).length;

    return { userRank: betterCount + 1, totalBrands: total };
  }, [competitors, userAverageRank]);

  return (
    <BentoGrid>
      {/* Row 1: Total concurrents (large) + Nouveaux + En hausse */}
      <BentoItem className="lg:col-span-2">
        <StatCard
          icon={Users}
          label="Total concurrents"
          value={competitors.length.toString()}
          size="large"
          subtitle="marques détectées"
          tooltipTerm="competitor"
        />
      </BentoItem>

      <BentoItem>
        <StatCard
          icon={Sparkles}
          label="Nouveaux (7j)"
          value={trendCounts.newCount.toString()}
          valueClassName="text-primary"
          tooltipTerm="competitor"
        />
      </BentoItem>

      <BentoItem>
        <StatCard
          icon={TrendingUp}
          label="En hausse"
          value={trendCounts.upCount.toString()}
          valueClassName="text-success"
          tooltipTerm="competitor"
        />
      </BentoItem>

      {/* Row 2: Votre classement (large) + En baisse */}
      <BentoItem className="lg:col-span-2">
        <UserRankingCard
          userRank={userRank}
          totalBrands={totalBrands}
          trend={averageRankTrend}
          sparklineData={averageRankSparkline}
        />
      </BentoItem>

      <BentoItem className="lg:col-span-2">
        <StatCard
          icon={TrendingDown}
          label="En baisse"
          value={trendCounts.downCount.toString()}
          valueClassName="text-destructive"
          tooltipTerm="competitor"
        />
      </BentoItem>
    </BentoGrid>
  );
}
