'use client';

import { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SimpleTrend } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';

interface CompetitorRanking {
  name: string;
  mentions: number;
  shareOfVoice: number;
  trend: SimpleTrend;
}

interface CompetitorRankingTableProps {
  data: CompetitorRanking[];
  userBrandName: string;
}

function TrendIcon({ trend }: { trend: SimpleTrend }): React.ReactNode {
  if (trend === 'up') {
    return <TrendingUp className="size-4 text-success" aria-hidden="true" />;
  }
  if (trend === 'down') {
    return <TrendingDown className="size-4 text-destructive" aria-hidden="true" />;
  }
  return <Minus className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export const CompetitorRankingTable = memo(function CompetitorRankingTable({
  data,
  userBrandName,
}: CompetitorRankingTableProps): React.ReactNode {
  const { top5, userEntry, userRank, isUserInTop5 } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.shareOfVoice - a.shareOfVoice);
    const userIndex = sorted.findIndex((c) => c.name.toLowerCase() === userBrandName.toLowerCase());
    const user = userIndex !== -1 ? sorted[userIndex] : null;
    const inTop5 = userIndex !== -1 && userIndex < 5;

    return {
      top5: sorted.slice(0, 5),
      userEntry: user,
      userRank: userIndex !== -1 ? userIndex + 1 : null,
      isUserInTop5: inTop5,
    };
  }, [data, userBrandName]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 p-8 text-center">
        <p className="text-muted-foreground text-pretty">Aucun concurrent identifié</p>
      </div>
    );
  }

  const isUserRow = (name: string): boolean => name.toLowerCase() === userBrandName.toLowerCase();

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-card/80">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-12">
              #
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Concurrent
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-24">
              Mentions
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground w-28">
              Part de voix
            </th>
            <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-20">
              Tendance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {top5.map((competitor, index) => (
            <tr
              key={competitor.name}
              className={cn(
                isUserRow(competitor.name) ? 'bg-primary/10' : 'bg-background/30 hover:bg-muted/50',
              )}
            >
              <td className="px-4 py-4 text-sm font-medium text-muted-foreground tabular-nums">
                {index + 1}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{competitor.name}</span>
                  {isUserRow(competitor.name) && (
                    <Badge variant="default" className="text-xs">
                      Vous
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-right text-sm tabular-nums">{competitor.mentions}</td>
              <td className="px-4 py-4 text-right text-sm font-medium tabular-nums">
                {competitor.shareOfVoice.toFixed(1)}%
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-center">
                  <TrendIcon trend={competitor.trend} />
                </div>
              </td>
            </tr>
          ))}

          {!isUserInTop5 && userEntry && userRank && (
            <>
              <tr className="border-t-2 border-dashed border-primary/20">
                <td colSpan={5} className="h-0" />
              </tr>
              <tr className="bg-primary/10">
                <td className="px-4 py-4 text-sm font-medium text-muted-foreground tabular-nums">
                  {userRank}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{userEntry.name}</span>
                    <Badge variant="default" className="text-xs">
                      Vous
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-sm tabular-nums">{userEntry.mentions}</td>
                <td className="px-4 py-4 text-right text-sm font-medium tabular-nums">
                  {userEntry.shareOfVoice.toFixed(1)}%
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <TrendIcon trend={userEntry.trend} />
                  </div>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
});
