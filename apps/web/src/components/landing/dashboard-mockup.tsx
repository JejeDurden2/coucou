import { Bot, Heart, MessageSquare, Trophy, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/ui/sparkline';

const POSITION_SPARKLINE = [3.2, 2.8, 2.5, 2.7, 2.3, 2.1, 2.0];

export function DashboardMockup() {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur-xl opacity-0 animate-fade-in-up"
      style={{ animationDelay: '0.3s' }}
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Position moyenne — col-span-2, podium amber */}
        <div className="col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Position moyenne</p>
              <p className="text-3xl font-bold tabular-nums font-mono">
                <span className="text-xl text-muted-foreground">#</span>2.0
              </p>
              <p className="mt-1 text-xs text-muted-foreground">vs 7 derniers jours</p>
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-400">
              <Trophy className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3">
            <Sparkline data={POSITION_SPARKLINE} width={200} height={32} color="primary" />
          </div>
        </div>

        {/* GPT-4o — compact, hidden mobile */}
        <div className="hidden rounded-xl border border-border/50 bg-background/40 p-3 md:block">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            <span>GPT-4o</span>
          </div>
          <p className="text-lg font-semibold tabular-nums font-mono text-slate-300">
            <span className="text-sm text-muted-foreground">#</span>2.3
          </p>
        </div>

        {/* GPT-5.2 — compact, hidden mobile */}
        <div className="hidden rounded-xl border border-border/50 bg-background/40 p-3 md:block">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare className="size-3.5" aria-hidden="true" />
            <span>GPT-5.2</span>
          </div>
          <p className="text-lg font-semibold tabular-nums font-mono text-amber-400">
            <span className="text-sm text-muted-foreground">#</span>1.7
          </p>
        </div>

        {/* Sentiment IA — col-span-2 */}
        <div className="col-span-2 rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs text-muted-foreground">Sentiment IA</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums font-mono text-success">
                  78%
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
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-success" style={{ width: '78%' }} />
          </div>
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
              Marque reconnue
            </Badge>
            <Badge variant="outline" className="px-2 py-0.5 text-[10px]">
              Prix compétitifs
            </Badge>
          </div>
        </div>

        {/* Positions Claude — hidden mobile, col-span-2 */}
        <div className="hidden rounded-xl border border-border/50 bg-background/40 p-4 md:col-span-2 md:block">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs text-muted-foreground">Positions Claude</p>
              <ul className="space-y-1.5">
                <li className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-foreground">Sonnet 4</span>
                  <span className="text-lg font-semibold tabular-nums font-mono text-amber-400">
                    <span className="text-sm text-muted-foreground">#</span>1.6
                  </span>
                </li>
                <li className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-foreground">Opus 4.5</span>
                  <span className="text-lg font-semibold tabular-nums font-mono text-slate-300">
                    <span className="text-sm text-muted-foreground">#</span>2.4
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/50 p-2 text-muted-foreground">
              <Bot className="size-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* LLM Badges */}
      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
        <Badge variant="chatgpt">ChatGPT</Badge>
        <Badge variant="claude">Claude</Badge>
      </div>
    </div>
  );
}
