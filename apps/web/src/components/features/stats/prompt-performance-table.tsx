'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import type { PromptPerformance, PromptCategory } from '@coucou-ia/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SortKey = 'citationRate' | 'averageRank' | 'trend';
type SortOrder = 'asc' | 'desc';

interface PromptPerformanceTableProps {
  data: PromptPerformance[];
  onNavigateToOverview: () => void;
}

const CATEGORY_COLORS: Record<PromptCategory, string> = {
  Découverte: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  Comparaison: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  "Intention d'achat": 'bg-green-500/20 text-green-600 border-green-500/30',
  Local: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
};

function TruncatedPrompt({ content }: { content: string }): React.ReactElement {
  const maxLength = 50;
  const isTruncated = content.length > maxLength;
  const displayText = isTruncated ? `${content.slice(0, maxLength)}…` : content;

  if (!isTruncated) {
    return <span className="text-sm">{displayText}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <span className="text-sm cursor-help">{displayText}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[320px] bg-card border border-border p-3 text-sm">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CategoryBadge({
  category,
}: {
  category: PromptCategory | null;
}): React.ReactElement | null {
  if (!category) return null;

  return <Badge className={CATEGORY_COLORS[category]}>{category}</Badge>;
}

function TrendCell({ value }: { value: number }): React.ReactElement {
  function getColorClass(): string {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  }

  function renderIcon(): React.ReactNode {
    if (value > 0) return <TrendingUp className="size-3.5" aria-hidden="true" />;
    if (value < 0) return <TrendingDown className="size-3.5" aria-hidden="true" />;
    return null;
  }

  const sign = value > 0 ? '+' : '';

  return (
    <span className={cn('inline-flex items-center gap-1 tabular-nums', getColorClass())}>
      {renderIcon()}
      {sign}
      {value.toFixed(1)}%
    </span>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  sortOrder,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
}): React.ReactElement {
  const isActive = currentSortKey === sortKey;

  function renderSortIcon(): React.ReactNode {
    if (!isActive) {
      return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />;
    }
    const Icon = sortOrder === 'desc' ? ArrowDown : ArrowUp;
    return <Icon className="size-3.5" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {renderSortIcon()}
    </button>
  );
}

export function PromptPerformanceTable({
  data,
  onNavigateToOverview,
}: PromptPerformanceTableProps): React.ReactElement {
  const [sortKey, setSortKey] = useState<SortKey>('citationRate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const diff = sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      return diff;
    });
    return sorted.slice(0, 10);
  }, [data, sortKey, sortOrder]);

  const handleSort = (key: SortKey): void => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune donnée de performance disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Requête</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead className="text-right">
              <SortableHeader
                label="Part de voix"
                sortKey="citationRate"
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                label="Position moy."
                sortKey="averageRank"
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader
                label="Tendance"
                sortKey="trend"
                currentSortKey={sortKey}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.promptId}>
              <TableCell>
                <TruncatedPrompt content={item.content} />
              </TableCell>
              <TableCell>
                <CategoryBadge category={item.category} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.citationRate.toFixed(1)}%
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {item.averageRank.toFixed(1)}
              </TableCell>
              <TableCell className="text-right">
                <TrendCell value={item.trend} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {data.length > 10 && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onNavigateToOverview} className="gap-1.5">
            Voir tous les prompts
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
