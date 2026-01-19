'use client';

import { memo, useState, useCallback } from 'react';
import { ChevronDown, Trash2, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProviderResult {
  isCited: boolean;
  position: number | null;
  verbatim?: string;
}

interface PromptCardProps {
  promptId: string;
  content: string;
  category?: string;
  openai: ProviderResult | null;
  anthropic: ProviderResult | null;
  onDelete?: (promptId: string) => void;
  isDeleting?: boolean;
  disabled?: boolean;
}

function PositionIndicator({
  result,
  provider,
}: {
  result: ProviderResult | null;
  provider: 'chatgpt' | 'claude';
}) {
  if (!result) {
    return <EyeOff className="h-3 w-3 text-muted-foreground" aria-label="Pas encore scanné" />;
  }

  if (result.isCited) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
          provider === 'chatgpt' ? 'bg-chatgpt/20 text-chatgpt' : 'bg-claude/20 text-claude',
        )}
      >
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            provider === 'chatgpt' ? 'bg-chatgpt' : 'bg-claude',
          )}
        />
        #{result.position}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-destructive/10 text-destructive">
      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
      Non cité
    </span>
  );
}

export const PromptCard = memo(function PromptCard({
  promptId,
  content,
  category,
  openai,
  anthropic,
  onDelete,
  isDeleting,
  disabled,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCitedByAny = openai?.isCited || anthropic?.isCited;
  const hasVerbatim = openai?.verbatim || anthropic?.verbatim;

  const handleToggle = useCallback(() => {
    if (hasVerbatim) {
      setIsExpanded((prev) => !prev);
    }
  }, [hasVerbatim]);

  const handleDelete = useCallback(() => {
    onDelete?.(promptId);
  }, [onDelete, promptId]);

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card transition-all duration-200',
        'hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5',
        isCitedByAny && 'border-l-2 border-l-success',
        (isDeleting || disabled) && 'opacity-50 pointer-events-none',
      )}
    >
      {/* Main Content */}
      <button
        type="button"
        className={cn(
          'p-4 flex items-start gap-4 w-full text-left',
          hasVerbatim && 'cursor-pointer',
          !hasVerbatim && 'cursor-default',
        )}
        onClick={handleToggle}
        disabled={!hasVerbatim}
        aria-expanded={hasVerbatim ? isExpanded : undefined}
      >
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">{content}</p>
          {category && (
            <Badge variant="muted" className="mt-2 text-[10px]">
              {category}
            </Badge>
          )}
        </div>

        {/* Provider Results */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">ChatGPT</span>
            <PositionIndicator result={openai} provider="chatgpt" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase">Claude</span>
            <PositionIndicator result={anthropic} provider="claude" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {hasVerbatim && (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              aria-label="Supprimer ce prompt"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </button>

      {/* Expanded Verbatim */}
      {isExpanded && hasVerbatim && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {openai?.verbatim && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-chatgpt" />
                <span className="text-xs font-medium text-chatgpt">ChatGPT</span>
              </div>
              <p className="text-xs text-muted-foreground italic pl-4 border-l-2 border-chatgpt/30">
                &quot;{openai.verbatim}&quot;
              </p>
            </div>
          )}
          {anthropic?.verbatim && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-claude" />
                <span className="text-xs font-medium text-claude">Claude</span>
              </div>
              <p className="text-xs text-muted-foreground italic pl-4 border-l-2 border-claude/30">
                &quot;{anthropic.verbatim}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
