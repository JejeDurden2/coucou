'use client';

import { memo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  Target,
  TrendingDown,
  Users,
} from 'lucide-react';
import type { Recommendation, RecommendationType, RecommendationSeverity } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  className?: string;
}

const SEVERITY_CONFIG: Record<
  RecommendationSeverity,
  { icon: typeof AlertTriangle; colorClass: string; bgClass: string; borderClass: string }
> = {
  critical: {
    icon: AlertTriangle,
    colorClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive/30',
  },
  warning: {
    icon: AlertTriangle,
    colorClass: 'text-warning',
    bgClass: 'bg-warning/10',
    borderClass: 'border-warning/30',
  },
  info: {
    icon: Info,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/30',
  },
};

const TYPE_ICONS: Record<RecommendationType, typeof Target> = {
  low_citation: TrendingDown,
  competitor_dominance: Users,
  provider_disparity: Target,
  prompt_weakness: Target,
  improvement: Lightbulb,
};

export const RecommendationsPanel = memo(function RecommendationsPanel({
  recommendations,
  className,
}: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className={cn('rounded-lg border border-border bg-card p-6 text-center', className)}>
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground">Aucune recommandation pour le moment</p>
        <p className="text-xs text-muted-foreground mt-1">
          Continuez à scanner pour obtenir des insights personnalisés
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Recommandations ({recommendations.length})
      </h2>
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </div>
    </div>
  );
});

interface RecommendationCardProps {
  recommendation: Recommendation;
}

const RecommendationCard = memo(function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = SEVERITY_CONFIG[recommendation.severity];
  const TypeIcon = TYPE_ICONS[recommendation.type];
  const SeverityIcon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card overflow-hidden transition-colors',
        config.borderClass,
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className={cn('p-1.5 rounded-md mt-0.5', config.bgClass)}>
          <SeverityIcon className={cn('h-4 w-4', config.colorClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium truncate">{recommendation.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {recommendation.description}
          </p>
        </div>
        <div className="text-muted-foreground mt-1">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {isExpanded ? (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Actions recommandées
          </p>
          <ul className="space-y-1.5">
            {recommendation.actionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
});
