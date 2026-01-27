'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, EyeOff } from 'lucide-react';
import {
  type EnrichedCompetitor,
  type CompetitorModelStats,
  type Plan,
  PLAN_MODELS,
  type LLMModel,
} from '@coucou-ia/shared';
import { getModelDisplayName } from '@/components/features/dashboard/llm-result-row';
import { formatRelativeTime } from '@/lib/format';

// Shared types
export interface CompetitorCardProps {
  competitor: EnrichedCompetitor;
  rank: number;
  userPlan: Plan;
  showContext?: boolean;
  showStats?: boolean;
}

// TrendBadge component
interface TrendBadgeProps {
  trend: EnrichedCompetitor['trend'];
  percentage: number | null;
}

export function TrendBadge({ trend, percentage }: TrendBadgeProps): React.ReactNode {
  if (trend === 'new') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/12 text-primary">
        <Sparkles className="size-3" aria-hidden="true" />
        NEW
      </span>
    );
  }

  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="size-3" aria-hidden="true" />
        {percentage !== null ? `+${percentage}%` : null}
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="size-3" aria-hidden="true" />
        {percentage !== null ? `${percentage}%` : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3" aria-hidden="true" />
    </span>
  );
}

// ModelPositions component
interface ModelPositionsProps {
  statsByModel: CompetitorModelStats[];
  userPlan: Plan;
}

export function ModelPositions({ statsByModel, userPlan }: ModelPositionsProps): React.ReactNode {
  const allowedModels = PLAN_MODELS[userPlan];
  const filteredStats = statsByModel.filter((s) => allowedModels.includes(s.model as LLMModel));

  if (filteredStats.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {filteredStats.map((stat) => (
        <div key={stat.model} className="flex items-center gap-1.5">
          <span>{getModelDisplayName(stat.model)}</span>
          {stat.averagePosition !== null ? (
            <span className="font-medium text-foreground tabular-nums">
              #{stat.averagePosition}
            </span>
          ) : (
            <EyeOff className="size-3" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

// KeywordBadges component
interface KeywordBadgesProps {
  keywords: string[];
}

export function KeywordBadges({ keywords }: KeywordBadgesProps): React.ReactNode {
  if (keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((keyword) => (
        <span
          key={keyword}
          className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize"
        >
          {keyword}
        </span>
      ))}
    </div>
  );
}

// Unified CompetitorCard component
export const CompetitorCard = memo(function CompetitorCard({
  competitor,
  rank,
  userPlan,
  showContext = false,
  showStats = false,
}: CompetitorCardProps): React.ReactNode {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground tabular-nums">#{rank}</span>
          <div>
            <h4 className="font-semibold text-foreground text-balance">{competitor.name}</h4>
            {competitor.averagePosition !== null && (
              <p className="text-xs text-muted-foreground text-pretty">
                Position moyenne : {competitor.averagePosition}
              </p>
            )}
          </div>
        </div>
        <TrendBadge trend={competitor.trend} percentage={competitor.trendPercentage} />
      </div>

      {/* Stats (optional) */}
      {showStats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{competitor.totalMentions} mentions</span>
          <span>Vu {formatRelativeTime(competitor.lastSeenAt)}</span>
        </div>
      )}

      {/* Keywords */}
      {competitor.keywords.length > 0 && <KeywordBadges keywords={competitor.keywords} />}

      {/* Model positions */}
      <ModelPositions statsByModel={competitor.statsByModel} userPlan={userPlan} />

      {/* Last context (optional) */}
      {showContext && competitor.lastContext && (
        <p className="text-xs text-muted-foreground italic line-clamp-2 border-l-2 border-muted pl-2 text-pretty">
          &ldquo;{competitor.lastContext}&rdquo;
        </p>
      )}
    </div>
  );
});
