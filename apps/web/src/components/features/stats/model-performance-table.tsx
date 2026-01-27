'use client';

import { memo, useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Lock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react';
import {
  type Plan,
  PLAN_MODELS,
  type LLMModel,
  type HistoricalModelBreakdown,
  type SimpleTrend,
} from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getModelDisplayName } from '@/components/features/dashboard/llm-result-row';
import { cn } from '@/lib/utils';

type SortColumn = 'model' | 'citationRate' | 'averageRank' | 'trend' | 'scansCount';
type SortDirection = 'asc' | 'desc';

interface ModelPerformanceTableProps {
  data: HistoricalModelBreakdown[];
  userPlan: Plan;
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
}: SortableHeaderProps): React.ReactNode {
  const isActive = currentColumn === column;

  function renderSortIcon(): React.ReactNode {
    if (!isActive) return null;
    const Icon = direction === 'asc' ? ChevronUp : ChevronDown;
    return <Icon className="size-3" aria-hidden="true" />;
  }

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
        {renderSortIcon()}
      </span>
    </th>
  );
}

function ModelTrendBadge({ trend }: { trend: SimpleTrend }): React.ReactNode {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <TrendingUp className="size-3" aria-hidden="true" />
      </span>
    );
  }

  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <TrendingDown className="size-3" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3" aria-hidden="true" />
    </span>
  );
}

const TREND_SORT_ORDER: Record<SimpleTrend, number> = {
  up: 1,
  stable: 0,
  down: -1,
};

export const ModelPerformanceTable = memo(function ModelPerformanceTable({
  data,
  userPlan,
}: ModelPerformanceTableProps): React.ReactNode {
  const [sortColumn, setSortColumn] = useState<SortColumn>('citationRate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const allowedModels = PLAN_MODELS[userPlan];

  const isModelAccessible = (model: string): boolean => allowedModels.includes(model as LLMModel);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'model':
          comparison = getModelDisplayName(a.model).localeCompare(getModelDisplayName(b.model));
          break;
        case 'citationRate':
          comparison = a.citationRate - b.citationRate;
          break;
        case 'averageRank':
          // Null ranks go to the end
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
  }, [data, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn): void => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      // Sensible defaults: citationRate/scansCount DESC, averageRank/trend ASC
      const defaultDesc =
        column === 'citationRate' || column === 'scansCount' || column === 'trend';
      setSortDirection(defaultDesc ? 'desc' : 'asc');
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance par modèle</CardTitle>
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
        <CardTitle className="text-base">Performance par modèle</CardTitle>
        <CardDescription>Statistiques par modèle d'IA</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <SortableHeader
                    label="Modèle"
                    column="model"
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
                {sortedData.map((model) => {
                  const accessible = isModelAccessible(model.model);

                  const row = (
                    <tr
                      key={model.model}
                      className={cn(
                        accessible
                          ? 'hover:bg-muted/50'
                          : 'opacity-50 cursor-not-allowed bg-muted/20',
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-sm font-medium">
                          {getModelDisplayName(model.model)}
                          {!accessible && (
                            <Lock className="size-3 text-muted-foreground" aria-hidden="true" />
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {model.citationRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {model.averageRank !== null ? `#${model.averageRank.toFixed(1)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ModelTrendBadge trend={model.trend} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm tabular-nums">
                        {model.scansCount}
                      </td>
                    </tr>
                  );

                  if (!accessible) {
                    return (
                      <Tooltip key={model.model} delayDuration={150}>
                        <TooltipTrigger asChild>{row}</TooltipTrigger>
                        <TooltipContent>
                          <p className="text-pretty">Disponible sur le plan Pro</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return row;
                })}
              </tbody>
            </table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
});
