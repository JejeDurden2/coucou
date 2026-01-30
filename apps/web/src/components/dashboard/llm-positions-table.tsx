import { memo, useMemo } from 'react';
import {
  getProviderForModel,
  getModelPriority,
  LLMProvider,
  type LLMModel,
} from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { ProviderLogo } from '@/components/ui/provider-logo';

interface LLMPositionsTableProps {
  positions: { model: string; position: number | null }[];
  size?: 'sm' | 'md';
}

function getPositionColor(position: number | null): string {
  if (position === null) return 'text-muted-foreground';
  if (position <= 2) return 'text-success';
  if (position <= 4) return 'text-foreground';
  return 'text-muted-foreground';
}

interface ProviderPosition {
  provider: LLMProvider;
  position: number | null;
}

function groupByProvider(
  positions: { model: string; position: number | null }[],
): ProviderPosition[] {
  const byProvider = new Map<LLMProvider, { model: string; position: number | null }[]>();

  for (const pos of positions) {
    const provider = getProviderForModel(pos.model as LLMModel);
    const existing = byProvider.get(provider) ?? [];
    existing.push(pos);
    byProvider.set(provider, existing);
  }

  const result: ProviderPosition[] = [];
  for (const [provider, models] of byProvider) {
    // Take the position from the highest priority model
    const sorted = [...models].sort(
      (a, b) => getModelPriority(b.model) - getModelPriority(a.model),
    );
    result.push({ provider, position: sorted[0].position });
  }

  // Sort by provider order: CHATGPT first, then CLAUDE
  return result.sort((a, b) => {
    const order = { [LLMProvider.CHATGPT]: 0, [LLMProvider.CLAUDE]: 1 };
    return order[a.provider] - order[b.provider];
  });
}

export const LLMPositionsTable = memo(function LLMPositionsTable({
  positions,
  size = 'sm',
}: LLMPositionsTableProps) {
  const providerPositions = useMemo(() => groupByProvider(positions), [positions]);

  if (providerPositions.length === 0) return null;

  const gridCols = {
    gridTemplateColumns: `repeat(${providerPositions.length}, minmax(0, 1fr))`,
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="grid" style={gridCols}>
            {providerPositions.map(({ provider }) => (
              <th
                key={provider}
                scope="col"
                className={cn(
                  'flex items-center justify-center gap-1 font-normal text-muted-foreground',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                )}
              >
                <ProviderLogo provider={provider} size="sm" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="grid" style={gridCols}>
            {providerPositions.map(({ provider, position }) => (
              <td
                key={provider}
                className={cn(
                  'text-center tabular-nums font-semibold',
                  size === 'sm' ? 'text-sm' : 'text-base',
                  getPositionColor(position),
                )}
              >
                {position !== null ? position.toFixed(1) : '—'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
});
