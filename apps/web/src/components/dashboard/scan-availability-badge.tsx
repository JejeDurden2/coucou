import { memo } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { PLAN_LIMITS, type Plan } from '@coucou-ia/shared';

import { formatRelativeTimeFuture } from '@/lib/format';

interface ScanAvailabilityBadgeProps {
  lastScanAt: Date | null;
  canScan: boolean;
  nextAvailableAt: Date | null;
  plan: Plan;
}

export const ScanAvailabilityBadge = memo(function ScanAvailabilityBadge({
  lastScanAt,
  canScan,
  nextAvailableAt,
  plan,
}: ScanAvailabilityBadgeProps): React.ReactNode {
  const frequency = PLAN_LIMITS[plan].scanFrequency === 'daily' ? 'jour' : 'semaine';

  if (lastScanAt === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs bg-muted text-muted-foreground">
        <Clock className="size-3" aria-hidden="true" />
        Jamais analysé
      </span>
    );
  }

  if (canScan) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs bg-success/10 text-success">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Analyse disponible
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs bg-warning/10 text-warning"
      title={`1 analyse/${frequency} - Prochaine analyse ${nextAvailableAt ? formatRelativeTimeFuture(nextAvailableAt) : ''}`}
    >
      <Clock className="size-3" aria-hidden="true" />
      {nextAvailableAt ? formatRelativeTimeFuture(nextAvailableAt) : `1/${frequency}`}
    </span>
  );
});
