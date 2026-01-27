import { Sparkles } from 'lucide-react';
import type { CompetitorTrend } from '@coucou-ia/shared';

interface CompetitorTrendBadgeProps {
  trend: CompetitorTrend;
}

export function CompetitorTrendBadge({ trend }: CompetitorTrendBadgeProps): React.ReactNode {
  if (trend === 'new') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
        <Sparkles className="size-3" aria-hidden="true" />
        NEW
      </span>
    );
  }

  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
        ↑
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
        ↓
      </span>
    );
  }

  return null;
}
