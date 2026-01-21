'use client';

import { memo, useMemo, useState } from 'react';
import { Lightbulb, Filter, CheckCircle2 } from 'lucide-react';
import type { Recommendation, RecommendationSeverity } from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecommendationCard, SEVERITY_CONFIG } from './recommendation-card';

interface RecommendationsContainerProps {
  recommendations: Recommendation[];
}

type FilterType = 'all' | RecommendationSeverity;

export const RecommendationsContainer = memo(function RecommendationsContainer({
  recommendations,
}: RecommendationsContainerProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Count by severity
  const counts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let info = 0;

    for (const r of recommendations) {
      if (r.severity === 'critical') critical++;
      else if (r.severity === 'warning') warning++;
      else info++;
    }

    return { total: recommendations.length, critical, warning, info };
  }, [recommendations]);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    const filtered =
      filter === 'all' ? recommendations : recommendations.filter((r) => r.severity === filter);

    // Sort by severity
    return [...filtered].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }, [recommendations, filter]);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Excellent travail!</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Aucune recommandation pour le moment. Continuez a scanner regulierement pour
                obtenir des insights personnalises sur votre visibilite IA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryStatCard label="Total" value={counts.total} />
        <SummaryStatCard
          label="Critiques"
          value={counts.critical}
          valueClassName="text-destructive"
        />
        <SummaryStatCard label="Attention" value={counts.warning} valueClassName="text-warning" />
        <SummaryStatCard label="Infos" value={counts.info} valueClassName="text-primary" />
      </div>

      {/* Filter + list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />
              <CardTitle>Toutes les recommandations</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div className="flex gap-1">
                <FilterButton
                  label="Tout"
                  count={counts.total}
                  active={filter === 'all'}
                  onClick={() => setFilter('all')}
                />
                <FilterButton
                  label="Critiques"
                  count={counts.critical}
                  active={filter === 'critical'}
                  onClick={() => setFilter('critical')}
                  severity="critical"
                />
                <FilterButton
                  label="Attention"
                  count={counts.warning}
                  active={filter === 'warning'}
                  onClick={() => setFilter('warning')}
                  severity="warning"
                />
                <FilterButton
                  label="Infos"
                  count={counts.info}
                  active={filter === 'info'}
                  onClick={() => setFilter('info')}
                  severity="info"
                />
              </div>
            </div>
          </div>
          <CardDescription>
            Actions concretes pour ameliorer votre visibilite dans les reponses IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRecommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune recommandation dans cette categorie
            </p>
          ) : (
            filteredRecommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
});

// Summary stat card
interface SummaryStatCardProps {
  label: string;
  value: number;
  valueClassName?: string;
}

function SummaryStatCard({ label, value, valueClassName }: SummaryStatCardProps): React.ReactNode {
  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${valueClassName ?? ''}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

// Filter button
interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  severity?: RecommendationSeverity;
}

function FilterButton({
  label,
  count,
  active,
  onClick,
  severity,
}: FilterButtonProps): React.ReactNode {
  if (count === 0 && !active) return null;

  const config = severity ? SEVERITY_CONFIG[severity] : null;

  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={
        active && config
          ? `${config.bgClass} ${config.colorClass} border-transparent hover:${config.bgClass}`
          : undefined
      }
    >
      {label}
      {count > 0 && (
        <span className="ml-1 text-xs opacity-70">({count})</span>
      )}
    </Button>
  );
}
