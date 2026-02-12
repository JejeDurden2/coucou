'use client';

import type { CompetitorBenchmark } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuditBenchmarkProps {
  competitors: CompetitorBenchmark[];
  clientScore: number;
  clientName: string;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-green-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
}

export function AuditBenchmarkSection({ competitors, clientScore, clientName }: AuditBenchmarkProps): React.ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-balance">Benchmark concurrentiel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Nom</th>
                <th className="pb-2 pr-4 font-medium">Domaine</th>
                <th className="pb-2 pr-4 font-medium text-right">Score GEO</th>
                <th className="pb-2 pr-4 font-medium hidden md:table-cell">Points forts</th>
                <th className="pb-2 font-medium hidden md:table-cell">Vos écarts</th>
              </tr>
            </thead>
            <tbody>
              {/* Client row */}
              <tr className="border-b border-border bg-primary/5">
                <td className="py-3 pr-4 font-medium">{clientName} (vous)</td>
                <td className="py-3 pr-4 text-muted-foreground">—</td>
                <td className={cn('py-3 pr-4 text-right tabular-nums font-semibold', getScoreColor(clientScore))}>
                  {clientScore}
                </td>
                <td className="py-3 pr-4 hidden md:table-cell text-muted-foreground">—</td>
                <td className="py-3 hidden md:table-cell text-muted-foreground">—</td>
              </tr>
              {/* Competitors */}
              {competitors.map((competitor) => (
                <tr key={competitor.domain} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium">{competitor.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground text-xs">{competitor.domain}</td>
                  <td className={cn('py-3 pr-4 text-right tabular-nums font-semibold', getScoreColor(competitor.geoScore))}>
                    {competitor.geoScore}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <ul className="space-y-0.5">
                      {competitor.strengths.slice(0, 2).map((s) => (
                        <li key={s} className="text-xs text-muted-foreground">{s}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <ul className="space-y-0.5">
                      {competitor.clientGaps.slice(0, 2).map((g) => (
                        <li key={g} className="text-xs text-muted-foreground">{g}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
