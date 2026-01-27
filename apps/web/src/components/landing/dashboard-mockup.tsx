import { BarChart3, Clock, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/ui/sparkline';

const SPARKLINE_DATA = [30, 35, 32, 45, 50, 48, 55, 60, 58, 65, 72];

export function DashboardMockup() {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-card/60 p-6 shadow-2xl shadow-primary/5 backdrop-blur-xl opacity-0 animate-fade-in-up"
      style={{ animationDelay: '0.3s' }}
      aria-hidden="true"
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Part de voix IA */}
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="size-3.5" aria-hidden="true" />
            <span>Part de voix IA</span>
          </div>
          <span className="text-2xl font-semibold tabular-nums font-mono">72%</span>
        </div>

        {/* Évolution */}
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" aria-hidden="true" />
            <span>Évolution</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold tabular-nums font-mono text-success">+15%</span>
            <Sparkline data={SPARKLINE_DATA} width={64} height={20} color="success" />
          </div>
        </div>

        {/* Concurrents détectés */}
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            <span>Concurrents détectés</span>
          </div>
          <span className="text-2xl font-semibold tabular-nums font-mono">3</span>
        </div>

        {/* Dernier scan */}
        <div className="rounded-xl border border-border/50 bg-background/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>Dernier scan</span>
          </div>
          <span className="text-2xl font-semibold font-mono">Il y a 2h</span>
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
