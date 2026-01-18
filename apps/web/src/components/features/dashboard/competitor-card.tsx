'use client';

import { useState, useCallback, memo } from 'react';
import type { EnrichedCompetitor } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Sparkles, EyeOff } from 'lucide-react';

interface CompetitorCardProps {
  competitor: EnrichedCompetitor;
  rank: number;
  maxMentions: number;
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
    <div className="flex flex-wrap gap-1 mt-2">
      {keywords.map((keyword) => (
        <span
          key={keyword}
          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground capitalize"
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
  maxMentions,
}: CompetitorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mentionProgress = (competitor.totalMentions / maxMentions) * 100;

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:bg-card-hover',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
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

      {/* Mentions */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Citations</span>
          <span className="font-semibold text-foreground tabular-nums">
            {competitor.totalMentions}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-500"
            style={{ transform: `scaleX(${mentionProgress / 100})` }}
          />
        </div>
      </div>

      {/* Provider Positions */}
      <ProviderPositions
        openai={competitor.statsByProvider.openai}
        anthropic={competitor.statsByProvider.anthropic}
      />

      {/* Keywords - only on hover */}
      {isHovered && <KeywordBadges keywords={competitor.keywords} />}

      {/* Context Tooltip */}
      {isHovered && competitor.lastContext && (
        <div className="absolute left-0 right-0 -bottom-2 translate-y-full z-10 p-3 rounded-lg bg-card border border-border shadow-xl text-xs">
          <p className="text-muted-foreground mb-1">Dernier contexte :</p>
          <p className="text-foreground italic line-clamp-2">
            &quot;{competitor.lastContext}&quot;
          </p>
        </div>
      )}
    </div>
  );
});
