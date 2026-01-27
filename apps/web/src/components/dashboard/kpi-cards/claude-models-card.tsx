import { memo } from 'react';
import { Bot, EyeOff } from 'lucide-react';
import { type ModelBreakdown } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { getModelDisplayName } from '@/components/features/dashboard/llm-result-row';

interface ClaudeModelsCardProps {
  models: ModelBreakdown[];
  className?: string;
}

function getRankColor(rank: number | null): string {
  if (rank === null) return 'text-muted-foreground';
  const rounded = Math.round(rank);
  if (rounded === 1) return 'text-amber-400';
  if (rounded === 2) return 'text-slate-300';
  if (rounded === 3) return 'text-orange-400';
  return 'text-foreground';
}

export const ClaudeModelsCard = memo(function ClaudeModelsCard({
  models,
  className,
}: ClaudeModelsCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-card p-4 h-full',
        'transition-colors duration-200 hover:bg-card-hover',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-3 text-pretty">Positions Claude</p>
          {models.length === 0 ? (
            <p className="text-sm text-muted-foreground text-pretty">Aucune donnée</p>
          ) : (
            <ul className="space-y-2">
              {models.map((model) => (
                <li key={model.model} className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-foreground truncate">
                    {getModelDisplayName(model.model)}
                  </span>
                  <span
                    className={cn(
                      'text-lg font-semibold tabular-nums',
                      getRankColor(model.averageRank),
                    )}
                  >
                    {model.averageRank !== null ? (
                      <>
                        <span className="text-sm text-muted-foreground">#</span>
                        {model.averageRank.toFixed(1)}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <EyeOff className="size-8" aria-hidden="true" />
                        <span className="text-lg">Non classé</span>
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg p-2 border border-border bg-muted/50 text-muted-foreground">
          <Bot className="size-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
});
