import { memo } from 'react';

const SAMPLE_THEMES = ['Innovation', 'Prix compétitif', 'Support client', 'Fiabilité', 'UX'];
const SAMPLE_KEYWORDS_POSITIVE = ['innovant', 'fiable', 'performant'];
const SAMPLE_KEYWORDS_NEGATIVE = ['complexe', 'coûteux'];

export const SentimentPreview = memo(function SentimentPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {/* GPT score card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-10 bg-muted rounded" />
          <span className="text-xs text-muted-foreground">GPT</span>
        </div>
        <p className="text-4xl font-bold text-success tabular-nums">72%</p>
        <div className="mt-2 h-2 w-full bg-muted rounded-full">
          <div className="h-2 bg-success/30 rounded-full" style={{ width: '72%' }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {SAMPLE_THEMES.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Claude score card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 w-10 bg-muted rounded" />
          <span className="text-xs text-muted-foreground">Claude</span>
        </div>
        <p className="text-4xl font-bold text-warning tabular-nums">58%</p>
        <div className="mt-2 h-2 w-full bg-muted rounded-full">
          <div className="h-2 bg-warning/30 rounded-full" style={{ width: '58%' }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {SAMPLE_THEMES.slice(2, 5).map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Keywords positive */}
      <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
        <div className="h-3 w-24 bg-muted rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          {SAMPLE_KEYWORDS_POSITIVE.map((kw) => (
            <span key={kw} className="px-2 py-1 rounded-md text-xs bg-success/10 text-success">
              {kw}
            </span>
          ))}
          {SAMPLE_KEYWORDS_NEGATIVE.map((kw) => (
            <span
              key={kw}
              className="px-2 py-1 rounded-md text-xs bg-destructive/10 text-destructive"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Evolution chart placeholder */}
      <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
        <div className="h-3 w-32 bg-muted rounded mb-3" />
        <svg viewBox="0 0 300 60" className="w-full h-16" aria-hidden="true">
          <path
            d="M0,50 Q30,45 60,40 T120,30 T180,25 T240,20 T300,15"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="2"
            opacity="0.3"
          />
          <path
            d="M0,40 Q30,38 60,35 T120,28 T180,30 T240,25 T300,22"
            fill="none"
            stroke="hsl(var(--warning))"
            strokeWidth="2"
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
});
