'use client';

import { memo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderKanban,
  Globe,
  Info,
  LayoutTemplate,
  Lightbulb,
  Search,
  Layers,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  Check,
  BookOpen,
} from 'lucide-react';
import type {
  Recommendation,
  RecommendationType,
  RecommendationSeverity,
  RecommendationImpact,
  RecommendationEffort,
  RecommendationSource,
} from '@coucou-ia/shared';
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
  platform_optimization: Globe,
  content_freshness: Clock,
  content_structure: LayoutTemplate,
  eeat_signal: ShieldCheck,
  prompt_category_gap: FolderKanban,
  triple_threat_optimization: Zap,
};

// Impact badge config
const IMPACT_CONFIG: Record<RecommendationImpact, { label: string; className: string }> = {
  high: { label: 'Impact fort', className: 'bg-success/10 text-success' },
  medium: { label: 'Impact moyen', className: 'bg-warning/10 text-warning' },
  low: { label: 'Impact faible', className: 'bg-muted text-muted-foreground' },
};

// Effort badge config
const EFFORT_CONFIG: Record<RecommendationEffort, { label: string; className: string }> = {
  low: { label: 'Rapide', className: 'bg-success/10 text-success' },
  medium: { label: 'Effort moyen', className: 'bg-warning/10 text-warning' },
  high: { label: 'Effort important', className: 'bg-destructive/10 text-destructive' },
};

function formatEstimatedTime(minutes: number): string {
  if (minutes < 60) return `~${minutes}min`;
  const hours = Math.round(minutes / 60);
  return `~${hours}h`;
}

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

  // Extract typed metadata
  const meta = recommendation.metadata as
    | {
        impact?: RecommendationImpact;
        effort?: RecommendationEffort;
        estimatedTimeMinutes?: number;
        sources?: RecommendationSource[];
      }
    | undefined;

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
                'text-2xs px-1.5 py-0.5 rounded-full font-medium',
                config.bgClass,
                config.colorClass,
              )}
            >
              {SEVERITY_LABELS[recommendation.severity]}
            </span>
            {meta?.impact && (
              <span
                className={cn(
                  'text-2xs px-1.5 py-0.5 rounded-full font-medium',
                  IMPACT_CONFIG[meta.impact].className,
                )}
              >
                {IMPACT_CONFIG[meta.impact].label}
              </span>
            )}
            {meta?.effort && (
              <span
                className={cn(
                  'text-2xs px-1.5 py-0.5 rounded-full font-medium',
                  EFFORT_CONFIG[meta.effort].className,
                )}
              >
                {EFFORT_CONFIG[meta.effort].label}
              </span>
            )}
            {meta?.estimatedTimeMinutes && (
              <span className="text-2xs px-1.5 py-0.5 rounded-full font-medium bg-muted text-muted-foreground inline-flex items-center gap-0.5">
                <Clock className="size-2.5" aria-hidden="true" />
                {formatEstimatedTime(meta.estimatedTimeMinutes)}
              </span>
            )}
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
              <span className="text-2xs text-muted-foreground">
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
          {meta?.sources && meta.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="size-3 text-muted-foreground" aria-hidden="true" />
                <p className="text-2xs text-muted-foreground font-medium uppercase">Sources</p>
              </div>
              <ul className="space-y-0.5">
                {meta.sources.map((src, i) => (
                  <li key={i} className="text-2xs text-muted-foreground">
                    <span className="font-medium">{src.source}</span>
                    <span className="opacity-70"> ({src.year})</span>
                    {src.claim && <span className="opacity-60"> — {src.claim}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
