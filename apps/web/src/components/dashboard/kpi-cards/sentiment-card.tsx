'use client';

import { memo, useMemo } from 'react';
import { Lock, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useUpgradeModal } from '@/hooks/use-upgrade';
import { useLatestSentiment, useSentimentHistory } from '@/hooks/use-sentiment';
import {
  getSentimentVariant,
  variantTextStyles,
  variantBgStyles,
  type SentimentVariant,
} from '@/features/sentiment/lib/sentiment-variant';
import { formatNextScanDate } from '@/lib/format';

interface SentimentBentoCardProps {
  projectId: string;
  userPlan: Plan;
  onNavigate?: () => void;
  className?: string;
}

const MAX_THEMES = 3;

const variantProgressColors: Record<SentimentVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

function SentimentDelta({ delta }: { delta: number }): React.ReactNode {
  if (delta === 0) return null;

  const isImprovement = delta > 0;
  const Icon = isImprovement ? ArrowUp : ArrowDown;
  const colorClass = isImprovement ? 'text-success' : 'text-destructive';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-medium tabular-nums',
        colorClass,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {Math.abs(delta)}%
    </span>
  );
}

export const SentimentBentoCard = memo(function SentimentBentoCard({
  projectId,
  userPlan,
  onNavigate,
  className,
}: SentimentBentoCardProps) {
  const isLocked = userPlan === Plan.FREE;
  const { openUpgradeModal } = useUpgradeModal();
  const { data, isLoading } = useLatestSentiment(projectId);
  const { data: history } = useSentimentHistory(projectId);

  const delta = useMemo(() => {
    if (!history?.scans || history.scans.length < 2) return null;
    const scans = history.scans;
    const latest = scans[scans.length - 1];
    const previous = scans[scans.length - 2];
    return latest.score - previous.score;
  }, [history]);

  const themes = useMemo(() => {
    return data?.scan?.results?.mistral?.t ?? [];
  }, [data]);

  if (isLocked) {
    return (
      <button
        type="button"
        onClick={() => openUpgradeModal('sentiment')}
        className={cn(
          'relative rounded-lg border border-border bg-card p-4 h-full w-full',
          'flex flex-col items-center justify-center gap-2 text-center',
          'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
          'cursor-pointer',
          className,
        )}
      >
        <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground text-pretty">Sentiment IA</p>
        <p className="text-xs text-muted-foreground text-pretty">Disponible dès le plan Solo</p>
        <span className="text-xs font-medium text-primary">Débloquer</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'relative rounded-lg border border-border bg-card p-4 h-full',
          'flex items-center justify-center',
          className,
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  if (!data?.scan) {
    return (
      <button
        type="button"
        onClick={onNavigate}
        aria-label="Voir le sentiment IA"
        className={cn(
          'relative rounded-lg border border-border bg-card p-4 h-full w-full text-left',
          'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
          'cursor-pointer',
          className,
        )}
      >
        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1 text-pretty">
          Sentiment IA
          <InfoTooltip term="sentiment" />
        </p>
        <p className="text-2xl font-semibold text-muted-foreground text-pretty">—</p>
        {data?.nextScanDate && (
          <p className="text-xs text-muted-foreground mt-1 text-pretty">
            Première analyse prévue {formatNextScanDate(data.nextScanDate)}
          </p>
        )}
      </button>
    );
  }

  const score = data.scan.globalScore;
  const { variant, icon: SentimentIcon } = getSentimentVariant(score);
  const displayedThemes = themes.slice(0, MAX_THEMES);
  const extraThemeCount = themes.length - MAX_THEMES;

  return (
    <button
      type="button"
      onClick={onNavigate}
      aria-label={`Sentiment IA : ${Math.round(score)}%`}
      className={cn(
        'relative rounded-lg border bg-card p-4 h-full w-full text-left',
        'transition-colors duration-200 hover:bg-card-hover hover:border-primary/30',
        'cursor-pointer flex flex-col',
        variantBgStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1 text-pretty">
            Sentiment IA
            <InfoTooltip term="sentiment" />
          </p>

          <div className="flex items-baseline gap-3">
            <p
              className={cn(
                'text-4xl font-bold tabular-nums text-pretty',
                variantTextStyles[variant],
              )}
            >
              {Math.round(score)}%
            </p>
            {delta !== null && <SentimentDelta delta={delta} />}
          </div>

          {delta !== null && (
            <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
              vs semaine précédente
            </p>
          )}
        </div>

        <div
          className={cn(
            'rounded-lg p-2 border',
            variantBgStyles[variant],
            variantTextStyles[variant],
          )}
        >
          <SentimentIcon className="size-6" aria-hidden="true" />
        </div>
      </div>

      <div
        className="mt-3 w-full h-2 rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Score sentiment"
      >
        <div
          className={cn('h-2 rounded-full', variantProgressColors[variant])}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {displayedThemes.length > 0 && (
        <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
          {displayedThemes.map((theme) => (
            <Badge key={theme.name} variant="outline" className="text-xs">
              {theme.name}
            </Badge>
          ))}
          {extraThemeCount > 0 && (
            <span className="inline-flex items-center text-xs text-muted-foreground px-1">
              +{extraThemeCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
});
