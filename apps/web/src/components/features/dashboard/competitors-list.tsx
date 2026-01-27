'use client';

import type { Competitor, EnrichedCompetitor, Plan } from '@coucou-ia/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompetitorCard } from '@/components/features/competitors/competitor-ui';

interface CompetitorsListProps {
  competitors: Competitor[];
  enrichedCompetitors?: EnrichedCompetitor[];
  maxItems?: number;
  userPlan: Plan;
  onViewMore?: () => void;
}

export function CompetitorsList({
  competitors,
  enrichedCompetitors,
  maxItems = 2,
  userPlan,
  onViewMore,
}: CompetitorsListProps): React.ReactNode {
  if (enrichedCompetitors && enrichedCompetitors.length > 0) {
    return (
      <EnrichedCompetitorsList
        competitors={enrichedCompetitors}
        maxItems={maxItems}
        userPlan={userPlan}
        onViewMore={onViewMore}
      />
    );
  }

  return (
    <SimpleCompetitorsList competitors={competitors} maxItems={maxItems} onViewMore={onViewMore} />
  );
}

interface EnrichedCompetitorsListProps {
  competitors: EnrichedCompetitor[];
  maxItems: number;
  userPlan: Plan;
  onViewMore?: () => void;
}

function EnrichedCompetitorsList({
  competitors,
  maxItems,
  userPlan,
  onViewMore,
}: EnrichedCompetitorsListProps): React.ReactNode {
  const displayedCompetitors = competitors.slice(0, maxItems);
  const remainingCount = competitors.length - maxItems;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="size-5 text-amber-500" aria-hidden="true" />
          <CardTitle className="text-lg font-medium">Top Concurrents</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">7 derniers jours</span>
      </CardHeader>
      <CardContent>
        {displayedCompetitors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 text-pretty">
            Aucun concurrent identifié. Lancez une analyse pour découvrir vos concurrents.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCompetitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.name}
                competitor={competitor}
                rank={index + 1}
                userPlan={userPlan}
              />
            ))}
            {remainingCount > 0 && <ViewMoreButton count={remainingCount} onClick={onViewMore} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SimpleCompetitorsListProps {
  competitors: Competitor[];
  maxItems: number;
  onViewMore?: () => void;
}

function SimpleCompetitorsList({
  competitors,
  maxItems,
  onViewMore,
}: SimpleCompetitorsListProps): React.ReactNode {
  const displayedCompetitors = competitors.slice(0, maxItems);
  const remainingCount = competitors.length - maxItems;
  const maxCount = Math.max(...competitors.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Benchmark concurrents</CardTitle>
        <Users className="size-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {displayedCompetitors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 text-pretty">
            Aucun concurrent identifié
          </p>
        ) : (
          <div className="space-y-3">
            {displayedCompetitors.map((competitor) => (
              <SimpleCompetitorRow
                key={competitor.name}
                name={competitor.name}
                count={competitor.count}
                maxCount={maxCount}
              />
            ))}
            {remainingCount > 0 && (
              <ViewMoreButton count={remainingCount} onClick={onViewMore} fullWidth />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Shared view more button
interface ViewMoreButtonProps {
  count: number;
  onClick?: () => void;
  fullWidth?: boolean;
}

function ViewMoreButton({ count, onClick, fullWidth }: ViewMoreButtonProps): React.ReactNode {
  const baseClass =
    'flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer';

  if (fullWidth) {
    return (
      <button type="button" onClick={onClick} className={cn(baseClass, 'w-full p-3')}>
        +{count} autre{count > 1 ? 's' : ''}
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(baseClass, 'p-4 min-h-[120px]')}>
      +{count} autre{count > 1 ? 's' : ''}
    </button>
  );
}

// Simple competitor row for basic list view
interface SimpleCompetitorRowProps {
  name: string;
  count: number;
  maxCount: number;
}

function SimpleCompetitorRow({ name, count, maxCount }: SimpleCompetitorRowProps): React.ReactNode {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground tabular-nums">
          {count} citation{count > 1 ? 's' : ''}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(count / maxCount) * 100}%` }}
        />
      </div>
    </div>
  );
}
