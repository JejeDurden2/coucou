'use client';

import { memo, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

import { type LLMProvider, getDisplayNameForProvider } from '@coucou-ia/shared';

import { ProviderLogo } from '@/components/ui/provider-logo';
import { useUpgradeModal } from '@/hooks/use-upgrade';
import { cn } from '@/lib/utils';

interface LockedProviderCardProps {
  provider: LLMProvider;
  className?: string;
}

export const LockedProviderCard = memo(function LockedProviderCard({
  provider,
  className,
}: LockedProviderCardProps): ReactNode {
  const { openUpgradeModal } = useUpgradeModal();
  const displayName = getDisplayNameForProvider(provider);

  return (
    <button
      type="button"
      onClick={() => openUpgradeModal('providers')}
      className={cn(
        'relative h-full w-full rounded-lg border border-border bg-card p-4',
        'transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5',
        'cursor-pointer text-left group',
        className,
      )}
      aria-label={`Débloquer ${displayName} avec le plan Solo`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-muted-foreground">{displayName}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
            <span>Plan Solo</span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/50 p-2 opacity-40">
          <ProviderLogo provider={provider} size="md" />
        </div>
      </div>
    </button>
  );
});
