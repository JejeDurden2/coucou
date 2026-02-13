'use client';

import type { AuditResult } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { getScoreColor, getBarColor } from './audit-utils';

interface AuditScoreOverviewProps {
  geoScore: AuditResult['geoScore'];
}

const SUB_SCORES = [
  { key: 'structure' as const, label: 'Structure' },
  { key: 'content' as const, label: 'Contenu' },
  { key: 'technical' as const, label: 'Technique' },
  { key: 'competitive' as const, label: 'Compétitivité' },
];

export function AuditScoreOverview({ geoScore }: AuditScoreOverviewProps): React.ReactNode {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <span className={cn('text-5xl font-bold tabular-nums', getScoreColor(geoScore.overall))}>
          {geoScore.overall}
        </span>
        <span className="text-lg text-muted-foreground">/100</span>
      </div>

      <div className="space-y-3">
        {SUB_SCORES.map(({ key, label }) => {
          const score = geoScore[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className="tabular-nums text-muted-foreground">{score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', getBarColor(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
