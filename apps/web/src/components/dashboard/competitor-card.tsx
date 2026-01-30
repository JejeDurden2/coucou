'use client';

import { memo, useMemo } from 'react';
import {
  type EnrichedCompetitor,
  type Plan,
  getModelsForPlan,
  type LLMModel,
} from '@coucou-ia/shared';
import { Card, CardContent } from '@/components/ui/card';
import { LLMPositionsTable } from '@/components/dashboard/llm-positions-table';
import { CompetitorTrendBadge } from '@/components/features/competitors/competitor-trend-badge';
import { formatRelativeTime } from '@/lib/format';

interface DashboardCompetitorCardProps {
  competitor: EnrichedCompetitor;
  rank: number;
  userPlan: Plan;
}

const MAX_VISIBLE_KEYWORDS = 4;

export const DashboardCompetitorCard = memo(function DashboardCompetitorCard({
  competitor,
  rank,
  userPlan,
}: DashboardCompetitorCardProps): React.ReactNode {
  const positions = useMemo(() => {
    const allowedModels = getModelsForPlan(userPlan);
    return competitor.statsByModel
      .filter((s) => allowedModels.includes(s.model as LLMModel))
      .map((s) => ({ model: s.model, position: s.averagePosition }));
  }, [competitor.statsByModel, userPlan]);

  const visibleKeywords = competitor.keywords.slice(0, MAX_VISIBLE_KEYWORDS);
  const overflowCount = competitor.keywords.length - MAX_VISIBLE_KEYWORDS;
  const lastContext = competitor.lastContext?.trim();

  return (
    <Card className="hover:border-primary/50 transition-all duration-200">
      <CardContent className="p-5 space-y-4">
        {/* Rank */}
        <span className="text-2xl font-bold text-muted-foreground tabular-nums">#{rank}</span>

        {/* Name + Trend Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xl font-semibold text-foreground text-balance">{competitor.name}</h4>
          <CompetitorTrendBadge trend={competitor.trend} />
        </div>

        {/* Metrics */}
        <p className="text-sm text-muted-foreground">
          {competitor.averagePosition !== null && (
            <>
              Position moyenne : {competitor.averagePosition}
              <span aria-hidden="true"> &middot; </span>
            </>
          )}
          {competitor.totalMentions} mention{competitor.totalMentions > 1 ? 's' : ''}
          <span aria-hidden="true"> &middot; </span>
          Vu {formatRelativeTime(competitor.lastSeenAt)}
        </p>

        {/* Last Context */}
        {lastContext && (
          <div className="bg-muted/50 rounded-md p-3">
            <p className="text-sm italic text-muted-foreground">&ldquo;{lastContext}&rdquo;</p>
          </div>
        )}

        {/* LLM Positions Table */}
        <LLMPositionsTable positions={positions} size="sm" />

        {/* Keywords */}
        {visibleKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize"
              >
                {keyword}
              </span>
            ))}
            {overflowCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{overflowCount}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
