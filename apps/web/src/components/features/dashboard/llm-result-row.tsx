import { LLMProvider } from '@coucou-ia/shared';
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

export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o-mini',
  'gpt-4o': 'GPT-4o',
  'gpt-5.2': 'GPT-5.2',
  'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
};

export function getModelDisplayName(model: string): string {
  return MODEL_DISPLAY_NAMES[model] ?? model;
}

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
