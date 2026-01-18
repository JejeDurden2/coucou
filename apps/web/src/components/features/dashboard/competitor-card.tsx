'use client';

import { useState, useCallback, memo } from 'react';
import type { EnrichedCompetitor } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface CompetitorCardProps {
  competitor: EnrichedCompetitor;
  rank: number;
  maxMentions: number;
}

const MEDAL_BY_RANK: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

function getMedalEmoji(rank: number): string | null {
  return MEDAL_BY_RANK[rank] ?? null;
}

const GRADIENT_BY_RANK: Record<number, string> = {
  1: 'from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/30',
  2: 'from-slate-300/20 via-gray-400/10 to-transparent border-slate-400/30',
  3: 'from-orange-600/20 via-amber-700/10 to-transparent border-orange-600/30',
};

const DEFAULT_GRADIENT = 'from-cyan-500/10 to-transparent border-cyan-500/20';

function getRankGradient(rank: number): string {
  return GRADIENT_BY_RANK[rank] ?? DEFAULT_GRADIENT;
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400 border border-violet-500/30 animate-pulse motion-reduce:animate-none">
        <Sparkles className="h-3 w-3" />
        NEW
      </span>
    );
  }

  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <TrendingUp className="h-3 w-3" />
        {percentage !== null && `+${percentage}%`}
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <TrendingDown className="h-3 w-3" />
        {percentage !== null && `${percentage}%`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-muted">
      <Minus className="h-3 w-3" />
      stable
    </span>
  );
}

function ProviderBreakdownBar({ openai, anthropic }: { openai: number; anthropic: number }) {
  const total = openai + anthropic;
  if (total === 0) return null;

  const openaiPercent = Math.round((openai / total) * 100);
  const anthropicPercent = 100 - openaiPercent;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          OpenAI {openaiPercent}%
        </span>
        <span className="flex items-center gap-1">
          Anthropic {anthropicPercent}%
          <span className="h-2 w-2 rounded-full bg-orange-500" />
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-[width] duration-500"
          style={{ width: `${openaiPercent}%` }}
        />
        <div
          className="h-full bg-orange-500 transition-[width] duration-500"
          style={{ width: `${anthropicPercent}%` }}
        />
      </div>
    </div>
  );
}

export const CompetitorCard = memo(function CompetitorCard({
  competitor,
  rank,
  maxMentions,
}: CompetitorCardProps) {
  const [showContext, setShowContext] = useState(false);
  const medal = getMedalEmoji(rank);
  const gradient = getRankGradient(rank);
  const mentionProgress = (competitor.totalMentions / maxMentions) * 100;

  const handleMouseEnter = useCallback(() => setShowContext(true), []);
  const handleMouseLeave = useCallback(() => setShowContext(false), []);

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-gradient-to-br p-4 transition-transform duration-200 hover:scale-[1.02] motion-reduce:hover:scale-100 cursor-pointer',
        gradient,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {medal ? (
            <span className="text-2xl">{medal}</span>
          ) : (
            <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
          )}
          <div>
            <h4 className="font-semibold text-foreground truncate max-w-[120px]">
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
          <span className="font-semibold text-cyan-400 tabular-nums">
            {competitor.totalMentions}
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-500 transition-[width] duration-500"
            style={{ width: `${mentionProgress}%` }}
          />
        </div>
      </div>

      {/* Provider Breakdown */}
      <ProviderBreakdownBar
        openai={competitor.mentionsByProvider.openai}
        anthropic={competitor.mentionsByProvider.anthropic}
      />

      {/* Context Tooltip */}
      {showContext && competitor.lastContext && (
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
