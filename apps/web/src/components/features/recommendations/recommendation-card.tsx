'use client';

import { memo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  Search,
  Layers,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Check,
} from 'lucide-react';
import type { Recommendation, RecommendationType, RecommendationSeverity } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';

// Severity configuration
export const SEVERITY_CONFIG: Record<
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

// Type icons mapping
export const TYPE_ICONS: Record<RecommendationType, typeof Target> = {
  low_citation: TrendingDown,
  competitor_dominance: Users,
  prompt_weakness: Target,
  keyword_gap: Search,
  model_disparity: Layers,
  position_drop: TrendingDown,
  emerging_competitor: TrendingUp,
  improvement: Lightbulb,
};

// Severity badge labels
const SEVERITY_LABELS: Record<RecommendationSeverity, string> = {
  critical: 'Critique',
  warning: 'Attention',
  info: 'Info',
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  showActionItems?: boolean;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export const RecommendationCard = memo(function RecommendationCard({
  recommendation,
  showActionItems = true,
  defaultExpanded = false,
  compact = false,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const config = SEVERITY_CONFIG[recommendation.severity];
  const TypeIcon = TYPE_ICONS[recommendation.type];
  const SeverityIcon = config.icon;

  function toggleItem(index: number): void {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  const completedCount = checkedItems.size;
  const totalItems = recommendation.actionItems.length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  if (compact) {
    return (
      <div
        className={cn('rounded-lg border bg-card p-3 flex items-start gap-3', config.borderClass)}
      >
        <div className={cn('p-1.5 rounded-md', config.bgClass)}>
          <SeverityIcon className={cn('size-4', config.colorClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TypeIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium truncate text-balance">{recommendation.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 text-pretty">
            {recommendation.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', config.borderClass)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className={cn('p-1.5 rounded-md mt-0.5', config.bgClass)}>
          <SeverityIcon className={cn('size-4', config.colorClass)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <h3 className="text-sm font-medium text-balance">{recommendation.title}</h3>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                config.bgClass,
                config.colorClass,
              )}
            >
              {SEVERITY_LABELS[recommendation.severity]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-pretty">
            {recommendation.description}
          </p>
          {showActionItems && totalItems > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 flex-1 max-w-24 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full',
                    progress === 100 ? 'bg-success' : 'bg-primary',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {completedCount}/{totalItems}
              </span>
            </div>
          )}
        </div>
        <div className="text-muted-foreground mt-1">
          {isExpanded ? (
            <ChevronDown className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          )}
        </div>
      </button>

      {isExpanded && showActionItems && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground font-medium uppercase mb-2 text-pretty">
            Actions recommandees
          </p>
          <ul className="space-y-2">
            {recommendation.actionItems.map((item, index) => {
              const isChecked = checkedItems.has(index);
              return (
                <li key={index} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => toggleItem(index)}
                    className={cn(
                      'mt-0.5 size-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                      isChecked
                        ? 'bg-success border-success text-white'
                        : 'border-muted-foreground/30 hover:border-primary',
                    )}
                    aria-label={isChecked ? 'Marquer comme non fait' : 'Marquer comme fait'}
                  >
                    {isChecked && <Check className="size-3" aria-hidden="true" />}
                  </button>
                  <span
                    className={cn(
                      'text-sm transition-colors',
                      isChecked ? 'text-muted-foreground line-through' : 'text-foreground/90',
                    )}
                  >
                    {item}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
});
