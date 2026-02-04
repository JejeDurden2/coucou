import { Bot, Heart, Trophy, TrendingDown } from 'lucide-react';

import { LLMProvider } from '@coucou-ia/shared';

import { Badge } from '@/components/ui/badge';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { Sparkline } from '@/components/ui/sparkline';

const POSITION_SPARKLINE = [3.2, 2.8, 2.5, 2.7, 2.3, 2.1, 2.0];
const SENTIMENT_SCORE = 78;

const PROVIDERS = [
  { name: 'ChatGPT', provider: LLMProvider.CHATGPT, position: '1.8', color: 'text-chatgpt' },
  { name: 'Claude', provider: LLMProvider.CLAUDE, position: '2.1', color: 'text-claude' },
] as const;

const SENTIMENT_TAGS = ['Marque reconnue', 'Prix compétitifs'] as const;

export function DashboardMockup() {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur-xl opacity-0 animate-fade-in-up"
      style={{ animationDelay: '0.3s' }}
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Position moyenne</p>
              <p className="text-3xl font-bold tabular-nums font-mono">
                <span className="text-xl text-muted-foreground">#</span>2.0
              </p>
              <p className="mt-1 text-xs text-muted-foreground">vs 7 derniers jours</p>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
              <Trophy className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <Sparkline data={POSITION_SPARKLINE} width={200} height={32} color="primary" />
          </div>
        </div>

        {PROVIDERS.map((provider) => (
          <div
            key={provider.name}
            className="hidden rounded-xl border border-border/50 bg-background/40 p-3 md:block"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ProviderLogo provider={provider.provider} size="sm" />
              <span>{provider.name}</span>
            </div>
            <p className={`text-lg font-semibold tabular-nums font-mono ${provider.color}`}>
              <span className="text-sm text-muted-foreground">#</span>
              {provider.position}
            </p>
          </div>
        ))}

        <div className="col-span-2 rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Sentiment IA</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums font-mono text-success">
                  {SENTIMENT_SCORE}%
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs font-medium text-destructive">
                  <TrendingDown className="size-3" aria-hidden="true" />
                  7%
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/50 p-2 text-muted-foreground">
              <Heart className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-1.5 rounded-full bg-success"
              style={{ width: `${SENTIMENT_SCORE}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SENTIMENT_TAGS.map((tag) => (
              <Badge key={tag} variant="outline" className="px-2 py-0.5 text-2xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="hidden rounded-xl border border-border/50 bg-background/40 p-4 md:col-span-2 md:block">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs text-muted-foreground">Part de voix</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums font-mono text-primary">
                  67%
                </span>
                <span className="text-sm text-muted-foreground">de citations</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Votre marque est recommandée dans 67% des requêtes surveillées
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/50 p-2 text-muted-foreground">
              <Bot className="size-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
        <Badge variant="chatgpt">ChatGPT</Badge>
        <Badge variant="claude">Claude</Badge>
      </div>
    </div>
  );
}
