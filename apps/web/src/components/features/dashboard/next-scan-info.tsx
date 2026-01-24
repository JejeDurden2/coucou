'use client';

import { Clock } from 'lucide-react';

import { formatNextScanDate } from '@/lib/format';

interface NextScanInfoProps {
  nextAutoScanAt: Date | string | null;
}

export function NextScanInfo({ nextAutoScanAt }: NextScanInfoProps): React.ReactNode {
  const isPast = nextAutoScanAt ? new Date(nextAutoScanAt).getTime() < Date.now() : true;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" aria-hidden="true" />
      {!nextAutoScanAt || isPast ? (
        <span>Scan en cours de planification…</span>
      ) : (
        <span>Prochain scan : {formatNextScanDate(nextAutoScanAt)}</span>
      )}
    </div>
  );
}
