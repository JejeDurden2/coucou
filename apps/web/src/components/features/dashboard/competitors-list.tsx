import type { Competitor } from '@coucou-ia/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface CompetitorsListProps {
  competitors: Competitor[];
  maxItems?: number;
}

export function CompetitorsList({
  competitors,
  maxItems = 10,
}: CompetitorsListProps) {
  const displayedCompetitors = competitors.slice(0, maxItems);
  const maxCount = Math.max(...competitors.map((c) => c.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Concurrents détectés
        </CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {displayedCompetitors.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun concurrent détecté
          </p>
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
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
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
