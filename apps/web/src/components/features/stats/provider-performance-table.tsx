'use client';

import { memo, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import {
  type HistoricalModelBreakdown,
  type SimpleTrend,
  LLMProvider,
  getDisplayNameForProvider,
} from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { cn } from '@/lib/utils';

type SortColumn = 'provider' | 'citationRate' | 'averageRank' | 'trend' | 'scansCount';
type SortDirection = 'asc' | 'desc';

interface ProviderPerformanceTableProps {
  data: HistoricalModelBreakdown[];
}

interface AggregatedProvider {
  provider: LLMProvider;
  citationRate: number;
  averageRank: number | null;
  trend: SimpleTrend;
  scansCount: number;
}

interface SortableHeaderProps {
  label: string;
  column: SortColumn;
  currentColumn: SortColumn;
  direction: SortDirection;
  onSort: (column: SortColumn) => void;
  align?: 'left' | 'center' | 'right';
}

function SortableHeader({
  label,
  column,
  currentColumn,
  direction,
  onSort,
  align = 'left',
}: SortableHeaderProps): React.ReactElement {
  const isActive = currentColumn === column;
  const SortIcon = direction === 'asc' ? ChevronUp : ChevronDown;

  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
      )}
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <SortIcon className="size-3" aria-hidden="true" />}
      </span>
    </th>
  );
}

const TREND_ICON_CONFIG: Record<SimpleTrend, { Icon: typeof TrendingUp; className: string }> = {
  up: { Icon: TrendingUp, className: 'text-success' },
  down: { Icon: TrendingDown, className: 'text-destructive' },
  stable: { Icon: Minus, className: 'text-muted-foreground' },
};

function ProviderTrendBadge({ trend }: { trend: SimpleTrend }): React.ReactElement {
  const { Icon, className } = TREND_ICON_CONFIG[trend];

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-medium', className)}>
      <Icon className="size-3" aria-hidden="true" />
    </span>
  );
}

const TREND_SORT_ORDER: Record<SimpleTrend, number> = { up: 1, stable: 0, down: -1 };

function aggregateTrend(trends: SimpleTrend[]): SimpleTrend {
  if (trends.includes('up')) return 'up';
  if (trends.includes('down')) return 'down';
  return 'stable';
}

export const ProviderPerformanceTable = memo(function ProviderPerformanceTable({
  data,
}: ProviderPerformanceTableProps): React.ReactElement {
  const [sortColumn, setSortColumn] = useState<SortColumn>('citationRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const aggregatedData = useMemo((): AggregatedProvider[] => {
    const providerMap = new Map<
      LLMProvider,
      { citationRates: number[]; averageRanks: number[]; trends: SimpleTrend[]; scansCount: number }
    >();

    for (const model of data) {
      const existing = providerMap.get(model.provider) ?? {
        citationRates: [],
        averageRanks: [],
        trends: [],
        scansCount: 0,
      };

      existing.citationRates.push(model.citationRate);
      if (model.averageRank !== null) {
        existing.averageRanks.push(model.averageRank);
      }
      existing.trends.push(model.trend);
      existing.scansCount += model.scansCount;

      providerMap.set(model.provider, existing);
    }

    return Array.from(providerMap.entries()).map(([provider, stats]) => {
      const avgCitationRate =
        stats.citationRates.length > 0
          ? stats.citationRates.reduce((a, b) => a + b, 0) / stats.citationRates.length
          : 0;

      const avgRank =
        stats.averageRanks.length > 0
          ? stats.averageRanks.reduce((a, b) => a + b, 0) / stats.averageRanks.length
          : null;

      return {
        provider,
        citationRate: avgCitationRate,
        averageRank: avgRank,
        trend: aggregateTrend(stats.trends),
        scansCount: stats.scansCount,
      };
    });
  }, [data]);

  const sortedData = useMemo(() => {
    return [...aggregatedData].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'provider':
          comparison = getDisplayNameForProvider(a.provider).localeCompare(
            getDisplayNameForProvider(b.provider),
          );
          break;
        case 'citationRate':
          comparison = a.citationRate - b.citationRate;
          break;
        case 'averageRank':
          if (a.averageRank === null && b.averageRank === null) comparison = 0;
          else if (a.averageRank === null) comparison = 1;
          else if (b.averageRank === null) comparison = -1;
          else comparison = a.averageRank - b.averageRank;
          break;
        case 'trend':
          comparison = TREND_SORT_ORDER[a.trend] - TREND_SORT_ORDER[b.trend];
          break;
        case 'scansCount':
          comparison = a.scansCount - b.scansCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [aggregatedData, sortColumn, sortDirection]);

  function handleSort(column: SortColumn): void {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(column);
    const columnsWithDescDefault: SortColumn[] = ['citationRate', 'scansCount', 'trend'];
    setSortDirection(columnsWithDescDefault.includes(column) ? 'desc' : 'asc');
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance par fournisseur</CardTitle>
          <CardDescription>Aucune donnée disponible</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <BarChart3 className="size-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              Aucune donnée pour cette période
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Performance par fournisseur</CardTitle>
        <CardDescription>Statistiques agrégées par fournisseur d'IA</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <SortableHeader
                  label="Fournisseur"
                  column="provider"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Part de voix"
                  column="citationRate"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
                <SortableHeader
                  label="Position moy."
                  column="averageRank"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
                <SortableHeader
                  label="Tendance"
                  column="trend"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="center"
                />
                <SortableHeader
                  label="Analyses"
                  column="scansCount"
                  currentColumn={sortColumn}
                  direction={sortDirection}
                  onSort={handleSort}
                  align="right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.map((provider) => (
                <tr key={provider.provider} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                      <ProviderLogo provider={provider.provider} size="sm" />
                      {getDisplayNameForProvider(provider.provider)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {provider.citationRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {provider.averageRank !== null ? `#${provider.averageRank.toFixed(1)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ProviderTrendBadge trend={provider.trend} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums">
                    {provider.scansCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
