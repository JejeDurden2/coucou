'use client';

import { memo, useMemo, useState } from 'react';
import { Lightbulb, Filter, CheckCircle2, Clock, Zap } from 'lucide-react';
import type {
  Recommendation,
  RecommendationSeverity,
  RecommendationCategory,
  RecommendationImpact,
} from '@coucou-ia/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { cn } from '@/lib/utils';
import { RecommendationCard, SEVERITY_CONFIG } from './recommendation-card';

interface RecommendationsContainerProps {
  recommendations: Recommendation[];
}

type SeverityFilter = 'all' | RecommendationSeverity;
type CategoryFilter = 'all' | RecommendationCategory;

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  content: 'Contenu',
  technical: 'Technique',
  monitoring: 'Veille',
};

function getMetaField<T>(rec: Recommendation, field: string): T | undefined {
  return (rec.metadata as Record<string, unknown> | undefined)?.[field] as T | undefined;
}

function formatTotalTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h${remaining}min`;
}

export const RecommendationsContainer = memo(function RecommendationsContainer({
  recommendations,
}: RecommendationsContainerProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Count by severity + compute summary stats
  const stats = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let info = 0;
    let quickWins = 0;
    let totalMinutes = 0;
    const categoryCount: Record<RecommendationCategory, number> = {
      content: 0,
      technical: 0,
      monitoring: 0,
    };

    for (const r of recommendations) {
      if (r.severity === 'critical') critical++;
      else if (r.severity === 'warning') warning++;
      else info++;

      const impact = getMetaField<RecommendationImpact>(r, 'impact');
      const effort = getMetaField<string>(r, 'effort');
      const time = getMetaField<number>(r, 'estimatedTimeMinutes');
      const category = getMetaField<RecommendationCategory>(r, 'category');

      if (impact === 'high' && effort === 'low') quickWins++;
      if (time) totalMinutes += time;
      if (category && category in categoryCount) categoryCount[category]++;
    }

    return {
      total: recommendations.length,
      critical,
      warning,
      info,
      quickWins,
      totalMinutes,
      categoryCount,
    };
  }, [recommendations]);

  // Filter and sort recommendations
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    if (severityFilter !== 'all') {
      filtered = filtered.filter((r) => r.severity === severityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (r) => getMetaField<RecommendationCategory>(r, 'category') === categoryFilter,
      );
    }

    // Sort by severity first, then by impact within same severity
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const impactOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

    return [...filtered].sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      const aImpact = getMetaField<string>(a, 'impact') ?? 'medium';
      const bImpact = getMetaField<string>(b, 'impact') ?? 'medium';
      return (impactOrder[aImpact] ?? 1) - (impactOrder[bImpact] ?? 1);
    });
  }, [recommendations, severityFilter, categoryFilter]);

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-balance">Excellent travail!</h3>
              <p className="text-sm text-muted-foreground max-w-md text-pretty">
                Aucune recommandation disponible. Continuez à analyser régulièrement pour obtenir
                des insights personnalisés sur votre visibilité IA.
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryStatCard label="Total" value={stats.total} />
        <SummaryStatCard
          label="Critiques"
          value={stats.critical}
          valueClassName="text-destructive"
        />
        <SummaryStatCard label="Attention" value={stats.warning} valueClassName="text-warning" />
        <SummaryStatCard label="Infos" value={stats.info} valueClassName="text-primary" />
        <SummaryStatCard
          label="Quick wins"
          value={stats.quickWins}
          valueClassName="text-success"
          icon={<Zap className="size-3.5 text-success" aria-hidden="true" />}
        />
        <SummaryStatCard
          label="Temps estimé"
          value={stats.totalMinutes > 0 ? formatTotalTime(stats.totalMinutes) : '-'}
          icon={<Clock className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        />
      </div>

      {/* Filter + list */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-warning" aria-hidden="true" />
              <CardTitle className="flex items-center gap-1">
                Toutes les recommandations
                <InfoTooltip term="recommendation" />
              </CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex gap-1 flex-wrap">
                  <FilterButton
                    label="Tout"
                    count={stats.total}
                    active={severityFilter === 'all'}
                    onClick={() => setSeverityFilter('all')}
                  />
                  <FilterButton
                    label="Critiques"
                    count={stats.critical}
                    active={severityFilter === 'critical'}
                    onClick={() => setSeverityFilter('critical')}
                    severity="critical"
                  />
                  <FilterButton
                    label="Attention"
                    count={stats.warning}
                    active={severityFilter === 'warning'}
                    onClick={() => setSeverityFilter('warning')}
                    severity="warning"
                  />
                  <FilterButton
                    label="Infos"
                    count={stats.info}
                    active={severityFilter === 'info'}
                    onClick={() => setSeverityFilter('info')}
                    severity="info"
                  />
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                <FilterButton
                  label="Tout"
                  count={stats.total}
                  active={categoryFilter === 'all'}
                  onClick={() => setCategoryFilter('all')}
                />
                {(Object.keys(CATEGORY_LABELS) as RecommendationCategory[]).map((cat) => (
                  <FilterButton
                    key={cat}
                    label={CATEGORY_LABELS[cat]}
                    count={stats.categoryCount[cat]}
                    active={categoryFilter === cat}
                    onClick={() => setCategoryFilter(cat)}
                  />
                ))}
              </div>
            </div>
          </div>
          <CardDescription>
            Actions concrètes pour améliorer votre visibilité dans les réponses IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredRecommendations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 text-pretty">
              Aucune recommandation dans cette catégorie
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
  value: number | string;
  valueClassName?: string;
  icon?: React.ReactNode;
}

function SummaryStatCard({
  label,
  value,
  valueClassName,
  icon,
}: SummaryStatCardProps): React.ReactNode {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-1.5">
          {icon}
          <p className="text-sm text-muted-foreground text-pretty">{label}</p>
        </div>
        <p className={cn('text-2xl font-bold tabular-nums', valueClassName)}>{value}</p>
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
          ? cn(config.bgClass, config.colorClass, 'border-transparent', `hover:${config.bgClass}`)
          : undefined
      }
    >
      {label}
      {count > 0 && <span className="ml-1 text-xs opacity-70">({count})</span>}
    </Button>
  );
}
