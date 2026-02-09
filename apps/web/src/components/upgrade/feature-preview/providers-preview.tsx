import { LLMProvider, getDisplayNameForProvider } from '@coucou-ia/shared';

import { ProviderLogo } from '@/components/ui/provider-logo';

const MOCK_PROVIDERS = [
  { provider: LLMProvider.CHATGPT, rank: '#2.1' },
  { provider: LLMProvider.CLAUDE, rank: '#1.8' },
  { provider: LLMProvider.MISTRAL, rank: '#3.4' },
] as const;

export function ProvidersPreview(): React.ReactNode {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {MOCK_PROVIDERS.map(({ provider, rank }) => (
        <div key={provider} className="rounded-lg border border-border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{getDisplayNameForProvider(provider)}</p>
              <p className="text-2xl font-semibold">{rank}</p>
            </div>
            <ProviderLogo provider={provider} size="md" />
          </div>
        </div>
      ))}
    </div>
  );
}
