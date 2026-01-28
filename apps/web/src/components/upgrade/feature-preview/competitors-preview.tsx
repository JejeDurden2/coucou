import { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SAMPLE_COMPETITORS = [
  { name: 'Concurrent A', citations: 8, trend: 'up' as const, position: 1 },
  { name: 'Concurrent B', citations: 5, trend: 'down' as const, position: 3 },
  { name: 'Concurrent C', citations: 4, trend: 'stable' as const, position: 4 },
  { name: 'Concurrent D', citations: 3, trend: 'up' as const, position: 5 },
  { name: 'Concurrent E', citations: 2, trend: 'down' as const, position: 7 },
  { name: 'Concurrent F', citations: 1, trend: 'stable' as const, position: 9 },
];

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const trendColors = {
  up: 'text-success',
  down: 'text-destructive',
  stable: 'text-muted-foreground',
};

export const CompetitorsPreview = memo(function CompetitorsPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {SAMPLE_COMPETITORS.map((competitor) => {
        const TrendIcon = trendIcons[competitor.trend];
        return (
          <div key={competitor.name} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-3 w-20 bg-muted rounded mb-2" />
                <p className="text-2xl font-bold tabular-nums">{competitor.citations}</p>
                <p className="text-xs text-muted-foreground">citations</p>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon
                  className={`size-4 ${trendColors[competitor.trend]}`}
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">#{competitor.position}</span>
              </div>
            </div>
            <div className="mt-3 flex gap-1">
              {[68, 45, 82].map((width, i) => (
                <div key={i} className="h-2 flex-1 bg-muted rounded-full">
                  <div className="h-2 bg-primary/20 rounded-full" style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
