'use client';

import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, EyeOff } from 'lucide-react';
import type { EnrichedCompetitor } from '@coucou-ia/shared';

interface CompetitorCardProps {
  competitor: EnrichedCompetitor;
  rank: number;
}

function TrendBadge({
  trend,
  percentage,
}: {
  trend: EnrichedCompetitor['trend'];
  percentage: number | null;
}) {
  if (trend === 'new') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/12 text-primary">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        NEW
      </span>
    );
  }

  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="h-3 w-3" aria-hidden="true" />
        {percentage !== null ? `+${percentage}%` : null}
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="h-3 w-3" aria-hidden="true" />
        {percentage !== null ? `${percentage}%` : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

function ProviderPositions({
  openai,
  anthropic,
}: {
  openai: { mentions: number; averagePosition: number | null };
  anthropic: { mentions: number; averagePosition: number | null };
}) {
  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span>ChatGPT</span>
        {openai.averagePosition !== null ? (
          <span className="font-medium text-foreground tabular-nums">
            #{openai.averagePosition}
          </span>
        ) : (
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <span>Claude</span>
        {anthropic.averagePosition !== null ? (
          <span className="font-medium text-foreground tabular-nums">
            #{anthropic.averagePosition}
          </span>
        ) : (
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function KeywordBadges({ keywords }: { keywords: string[] }) {
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

export const CompetitorCard = memo(function CompetitorCard({
  competitor,
  rank,
}: CompetitorCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground tabular-nums">#{rank}</span>
          <div>
            <h4 className="font-semibold text-foreground truncate max-w-[140px]">
              {competitor.name}
            </h4>
            {competitor.averagePosition !== null && (
              <p className="text-xs text-muted-foreground">
                Rang moyen: {competitor.averagePosition}
              </p>
            )}
          </div>
        </div>
        <TrendBadge trend={competitor.trend} percentage={competitor.trendPercentage} />
      </div>

      {competitor.keywords.length > 0 && (
        <div className="mb-3">
          <KeywordBadges keywords={competitor.keywords} />
        </div>
      )}

      <ProviderPositions
        openai={competitor.statsByProvider.openai}
        anthropic={competitor.statsByProvider.anthropic}
      />
    </div>
  );
});
