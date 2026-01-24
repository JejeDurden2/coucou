'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Smile, Lock, Loader2 } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useLatestSentiment } from '@/hooks/use-sentiment';
import { getSentimentVariant, variantTextStyles, variantBgStyles } from '../lib/sentiment-variant';

interface SentimentOverviewCardProps {
  projectId: string;
  userPlan: Plan;
  onNavigate?: () => void;
}

export const SentimentOverviewCard = memo(function SentimentOverviewCard({
  projectId,
  userPlan,
  onNavigate,
}: SentimentOverviewCardProps) {
  const isLocked = userPlan === Plan.FREE;
  const { data, isLoading } = useLatestSentiment(projectId);

  // Locked state for FREE users
  if (isLocked) {
    return (
      <Link
        href="/billing"
        className={cn(
          'relative rounded-lg border border-border bg-card p-4',
          'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
          'cursor-pointer block',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Sentiment IA</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-muted-foreground">—</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Plan Solo requis</p>
          </div>
          <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
            <Lock className="size-5" aria-hidden="true" />
          </div>
        </div>
      </Link>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        className={cn(
          'relative rounded-lg border border-border bg-card p-4 w-full text-left',
          'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
          'cursor-pointer',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">Sentiment IA</p>
            <div className="flex items-center gap-2 h-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Chargement...</p>
          </div>
          <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
            <Smile className="size-5" aria-hidden="true" />
          </div>
        </div>
      </button>
    );
  }

  // No scan yet
  if (!data?.scan) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        className={cn(
          'relative rounded-lg border border-border bg-card p-4 w-full text-left',
          'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
          'cursor-pointer',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              Sentiment IA
              <InfoTooltip term="sentiment" />
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-muted-foreground">—</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aucune analyse</p>
          </div>
          <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
            <Smile className="size-5" aria-hidden="true" />
          </div>
        </div>
      </button>
    );
  }

  // With data
  const { variant, icon: Icon } = getSentimentVariant(data.scan.globalScore);

  return (
    <button
      type="button"
      onClick={onNavigate}
      className={cn(
        'relative rounded-lg border bg-card p-4 w-full text-left',
        'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
        'cursor-pointer',
        variantBgStyles[variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            Sentiment IA
            <InfoTooltip term="sentiment" />
          </p>
          <div className="flex items-baseline gap-2">
            <p className={cn('text-2xl font-semibold tabular-nums', variantTextStyles[variant])}>
              {Math.round(data.scan.globalScore)}%
            </p>
          </div>
        </div>
        <div
          className={cn(
            'rounded-lg p-2 border',
            variantBgStyles[variant],
            variantTextStyles[variant],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
});
