import { memo } from 'react';

/** Fake sparkline chart data for stats preview */
const SAMPLE_BARS = [35, 42, 38, 55, 48, 62, 58, 70, 65, 75, 72, 80];

export const StatsPreview = memo(function StatsPreview() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Citation rate chart placeholder */}
      <div className="h-48 rounded-lg border border-border bg-card p-3">
        <div className="h-3 w-24 bg-muted rounded mb-3" />
        <div className="flex items-end gap-1 h-[120px]">
          {SAMPLE_BARS.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/20 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Rank trend chart placeholder */}
      <div className="h-48 rounded-lg border border-border bg-card p-3">
        <div className="h-3 w-28 bg-muted rounded mb-3" />
        <svg viewBox="0 0 200 100" className="w-full h-[120px]" aria-hidden="true">
          <path
            d="M0,80 Q25,70 50,60 T100,40 T150,30 T200,20"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M0,60 Q25,55 50,50 T100,35 T150,25 T200,15"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            opacity="0.2"
          />
        </svg>
      </div>

      {/* Model performance placeholder */}
      <div className="h-48 rounded-lg border border-border bg-card p-3">
        <div className="h-3 w-32 bg-muted rounded mb-3" />
        <div className="space-y-3 mt-2">
          {[
            { name: 'GPT-4o', width: 72 },
            { name: 'Claude', width: 65 },
            { name: 'Gemini', width: 53 },
          ].map(({ name, width }) => (
            <div key={name} className="flex items-center gap-2">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="flex-1 h-4 bg-muted/50 rounded-full">
                <div className="h-4 bg-primary/20 rounded-full" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitor chart placeholder */}
      <div className="h-48 rounded-lg border border-border bg-card p-3">
        <div className="h-3 w-20 bg-muted rounded mb-3" />
        <div className="space-y-2 mt-2">
          {[75, 52, 38, 25].map((width, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-12 bg-muted rounded" />
              <div className="flex-1 h-5 bg-muted/50 rounded">
                <div className="h-5 bg-primary/15 rounded" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
