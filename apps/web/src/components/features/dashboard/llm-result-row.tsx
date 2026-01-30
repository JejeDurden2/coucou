import { LLMProvider, getDisplayNameForProvider } from '@coucou-ia/shared';
import { CitationBadge } from './citation-badge';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { cn } from '@/lib/utils';

interface LLMResultRowProps {
  provider: LLMProvider;
  isCited: boolean;
  position: number | null;
  citationContext?: string | null;
  className?: string;
}

export function LLMResultRow({
  provider,
  isCited,
  position,
  citationContext,
  className,
}: LLMResultRowProps) {
  const displayName = getDisplayNameForProvider(provider);

  return (
    <div className={cn('flex items-center gap-4 rounded-lg bg-muted/50 p-4', className)}>
      <div className="flex items-center gap-3 min-w-[180px]">
        <ProviderLogo provider={provider} size="lg" />
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
