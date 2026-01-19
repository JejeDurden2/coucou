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

const modelNames: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o-mini',
  'gpt-4o': 'GPT-4o',
  'gpt-5.2': 'GPT-5.2',
  'claude-sonnet-4-5-20250514': 'Claude Sonnet 4.5',
  'claude-opus-4-5-20250514': 'Claude Opus 4.5',
  'claude-3-5-haiku-latest': 'Claude Haiku',
};

function getModelDisplayName(model: string): string {
  return modelNames[model] ?? model;
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
    <div className={cn('flex items-center gap-4 rounded-lg bg-slate-800/50 p-4', className)}>
      <div className="flex items-center gap-3 min-w-[180px]">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50',
            info.color,
          )}
        >
          <span className="text-lg font-bold">{info.icon}</span>
        </div>
        <span className="font-medium">{displayName}</span>
      </div>

      <div className="flex-1">
        <CitationBadge isCited={isCited} position={position} />
      </div>

      {citationContext && (
        <p className="flex-1 text-sm text-muted-foreground line-clamp-2">
          &ldquo;...{citationContext}...&rdquo;
        </p>
      )}
    </div>
  );
}
