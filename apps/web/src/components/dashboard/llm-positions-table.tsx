import { memo } from 'react';
import { getModelAbbreviation } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';

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

export const LLMPositionsTable = memo(function LLMPositionsTable({
  positions,
  size = 'sm',
}: LLMPositionsTableProps) {
  if (positions.length === 0) return null;

  const gridCols = { gridTemplateColumns: `repeat(${positions.length}, minmax(0, 1fr))` };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="grid" style={gridCols}>
            {positions.map(({ model }) => (
              <th
                key={model}
                scope="col"
                className={cn(
                  'text-center font-normal text-muted-foreground',
                  size === 'sm' ? 'text-xs' : 'text-sm',
                )}
              >
                {getModelAbbreviation(model)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="grid" style={gridCols}>
            {positions.map(({ model, position }) => (
              <td
                key={model}
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
