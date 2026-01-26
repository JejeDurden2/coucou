import { memo } from 'react';
import { EyeOff } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PulsingDot } from '@/components/ui/pulsing-dot';

interface CitationResult {
  isCited: boolean;
  position: number | null;
}

interface CitationStatusProps {
  result: CitationResult | null;
}

export const CitationStatus = memo(function CitationStatus({
  result,
}: CitationStatusProps): React.ReactNode {
  if (!result) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex mx-auto">
              <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Pas encore analysé</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (result.isCited) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <PulsingDot color="success" size="md" />
        {result.position !== null && (
          <span className="font-medium tabular-nums text-success text-xs">#{result.position}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-destructive">
      <span className="size-3 rounded-full bg-destructive/20 flex items-center justify-center">
        <span className="size-1.5 rounded-full bg-destructive" />
      </span>
    </span>
  );
});
