import { memo, type ReactNode } from 'react';

import { EyeOff } from 'lucide-react';

import { type LLMProvider, getDisplayNameForProvider } from '@coucou-ia/shared';

import { ProviderLogo } from '@/components/ui/provider-logo';
import { getPodiumStyle } from '@/lib/podium-style';
import { cn } from '@/lib/utils';

interface ProviderStatCardProps {
  provider: LLMProvider;
  averageRank: number | null;
  className?: string;
}

function RankDisplay({ averageRank }: { averageRank: number | null }): ReactNode {
  if (averageRank === null) {
    return (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <EyeOff className="size-5" aria-hidden="true" />
        <span className="text-sm">Non classé</span>
      </span>
    );
  }

  return (
    <>
      <span className="text-lg text-muted-foreground">#</span>
      {averageRank.toFixed(1)}
    </>
  );
}

export const ProviderStatCard = memo(function ProviderStatCard({
  provider,
  averageRank,
  className,
}: ProviderStatCardProps): ReactNode {
  const displayName = getDisplayNameForProvider(provider);
  const podiumClass = getPodiumStyle(averageRank);

  return (
    <div
      className={cn(
        'relative h-full rounded-lg border border-border bg-card p-4',
        'transition-colors duration-200 hover:bg-card-hover',
        podiumClass,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-muted-foreground">{displayName}</p>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            <RankDisplay averageRank={averageRank} />
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-2">
          <ProviderLogo provider={provider} size="md" />
        </div>
      </div>
    </div>
  );
});
