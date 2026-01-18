import { LLMProvider } from '@coucou-ia/shared';
import { CitationBadge } from './citation-badge';
import { cn } from '@/lib/utils';

interface LLMResultRowProps {
  provider: LLMProvider;
  isCited: boolean;
  position: number | null;
  citationContext?: string | null;
  className?: string;
}

const providerInfo: Record<LLMProvider, { name: string; logo: string; color: string }> = {
  [LLMProvider.OPENAI]: {
    name: 'ChatGPT',
    logo: '/logos/openai.svg',
    color: 'text-emerald-400',
  },
  [LLMProvider.ANTHROPIC]: {
    name: 'Claude',
    logo: '/logos/anthropic.svg',
    color: 'text-orange-400',
  },
};

export function LLMResultRow({
  provider,
  isCited,
  position,
  citationContext,
  className,
}: LLMResultRowProps) {
  const info = providerInfo[provider];

  return (
    <div className={cn('flex items-center gap-4 rounded-lg bg-slate-800/50 p-4', className)}>
      <div className="flex items-center gap-3 min-w-[140px]">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50',
            info.color,
          )}
        >
          <span className="text-lg font-bold">{provider === LLMProvider.OPENAI ? 'G' : 'C'}</span>
        </div>
        <span className="font-medium">{info.name}</span>
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
