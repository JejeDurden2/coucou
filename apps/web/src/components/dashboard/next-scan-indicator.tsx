'use client';

import { Clock } from 'lucide-react';

import { formatNextScanDate } from '@/lib/format';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NextScanIndicatorProps {
  nextAutoScanAt: Date | string | null;
}

export function NextScanIndicator({ nextAutoScanAt }: NextScanIndicatorProps): React.ReactNode {
  if (!nextAutoScanAt || new Date(nextAutoScanAt).getTime() < Date.now()) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden="true" />
            <span>Prochaine analyse : {formatNextScanDate(nextAutoScanAt)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Les analyses sont exécutées automatiquement selon votre plan</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
