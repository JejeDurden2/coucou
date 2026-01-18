'use client';

import { useState } from 'react';
import type { Competitor, EnrichedCompetitor } from '@coucou-ia/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trophy, ChevronUp } from 'lucide-react';
import { CompetitorCard } from './competitor-card';

interface CompetitorsListProps {
  competitors: Competitor[];
  enrichedCompetitors?: EnrichedCompetitor[];
  maxItems?: number;
}

export function CompetitorsList({
  competitors,
  enrichedCompetitors,
  maxItems = 5,
}: CompetitorsListProps) {
  if (enrichedCompetitors && enrichedCompetitors.length > 0) {
    return <EnrichedCompetitorsList competitors={enrichedCompetitors} maxItems={maxItems} />;
  }

  return <SimpleCompetitorsList competitors={competitors} maxItems={maxItems} />;
}

function EnrichedCompetitorsList({
  competitors,
  maxItems,
}: {
  competitors: EnrichedCompetitor[];
  maxItems: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayedCompetitors = showAll ? competitors : competitors.slice(0, maxItems);
  const maxMentions = Math.max(...competitors.map((c) => c.totalMentions), 1);
  const remainingCount = competitors.length - maxItems;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <CardTitle className="text-lg font-medium">Top Concurrents</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground">7 derniers jours</span>
      </CardHeader>
      <CardContent>
        {displayedCompetitors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucun concurrent détecté. Lancez un scan pour analyser vos concurrents.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCompetitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.name}
                competitor={competitor}
                rank={index + 1}
                maxMentions={maxMentions}
              />
            ))}
            {remainingCount > 0 && !showAll && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 p-4 text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                +{remainingCount} autre{remainingCount > 1 ? 's' : ''}
              </button>
            )}
            {showAll && remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 p-4 text-muted-foreground text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
                Réduire
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleCompetitorsList({
  competitors,
  maxItems,
}: {
  competitors: Competitor[];
  maxItems: number;
}) {
  const displayedCompetitors = competitors.slice(0, maxItems);
  const maxCount = Math.max(...competitors.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Concurrents détectés</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {displayedCompetitors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun concurrent détecté</p>
        ) : (
          <div className="space-y-3">
            {displayedCompetitors.map((competitor) => (
              <div key={competitor.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{competitor.name}</span>
                  <span className="text-muted-foreground">
                    {competitor.count} citation{competitor.count > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{
                      width: `${(competitor.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
