'use client';

import { HelpCircle } from 'lucide-react';
import { GEO_GLOSSARY, type GlossaryTerm } from '@coucou-ia/shared';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  term: GlossaryTerm;
  className?: string;
}

export function InfoTooltip({ term, className }: InfoTooltipProps): React.ReactElement {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              className,
            )}
            aria-label={`Information sur ${GEO_GLOSSARY[term].label}`}
          >
            <HelpCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] bg-card border border-border p-3 text-sm">
          {GEO_GLOSSARY[term].definition}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
