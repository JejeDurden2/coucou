import { LLMProvider, getModelDisplayName } from '@coucou-ia/shared';
import { CitationBadge } from './citation-badge';
import { cn } from '@/lib/utils';

interface LLMResultRowProps {
  provider: LLMProvider;
  model: string;
  isCited: boolean;
  position: number | null;
  citationContext?: string | null;
  className?: string;
}

const providerInfo: Record<LLMProvider, { color: string; icon: string }> = {
  [LLMProvider.OPENAI]: {
    color: 'text-emerald-400',
    icon: 'G',
  },
  [LLMProvider.ANTHROPIC]: {
    color: 'text-orange-400',
    icon: 'C',
  },
};

export function LLMResultRow({
  provider,
  model,
  isCited,
  position,
  citationContext,
  className,
}: LLMResultRowProps) {
  const info = providerInfo[provider];
  const displayName = getModelDisplayName(model);

  return (
    <div className={cn('flex items-center gap-4 rounded-lg bg-muted/50 p-4', className)}>
      <div className="flex items-center gap-3 min-w-[180px]">
        <div
          className={cn('flex size-10 items-center justify-center rounded-lg bg-muted', info.color)}
        >
          <span className="text-lg font-bold">{info.icon}</span>
        </div>
        <span className="font-medium">{displayName}</span>
      </div>

      <div className="flex-1">
        <CitationBadge isCited={isCited} position={position} />
      </div>

      {citationContext && (
        <p className="flex-1 text-sm text-muted-foreground line-clamp-2 text-pretty">
          &ldquo;...{citationContext}...&rdquo;
        </p>
      )}
    </div>
  );
}
