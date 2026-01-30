'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  Trophy,
  Radar,
  Users,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  Plan,
  type PromptPerformance,
  type PromptCategory,
  type HistoricalStats,
  LLMProvider,
  getDisplayNameForProvider,
} from '@coucou-ia/shared';
import { useHistoricalStats } from '@/hooks/use-historical-stats';
import { DateRangePicker, type DatePreset } from './date-range-picker';
import { CitationRateChart } from './citation-rate-chart';
import { ProviderPerformanceTable } from './provider-performance-table';
import { PromptPerformanceTable } from './prompt-performance-table';
import { CompetitorRankingTable } from './competitor-ranking-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KpiCard, KpiCardGrid } from '@/components/ui/kpi-card';
import { InsightCard } from '@/components/ui/insight-card';
import { Skeleton, SkeletonStatCard } from '@/components/ui/skeleton';

interface StatsContainerProps {
  projectId: string;
  userPlan: Plan;
  brandName: string;
  projectName: string;
  onNavigateToOverview: () => void;
}

type VariationType = 'increase' | 'decrease' | 'neutral';

function getDateRange(preset: DatePreset): { start: string; end: string } | undefined {
  const now = new Date();
  const end = now.toISOString().split('T')[0];

  if (preset === 'all') {
    return undefined;
  }

  const daysMap: Record<Exclude<DatePreset, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const days = daysMap[preset];
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    start: start.toISOString().split('T')[0],
    end,
  };
}

function getVariationType(variation: number | null): VariationType {
  if (variation === null) return 'neutral';
  if (variation > 0) return 'increase';
  if (variation < 0) return 'decrease';
  return 'neutral';
}

function generateCSV(data: HistoricalStats, projectName: string): void {
  const BOM = '\uFEFF';
  const SEP = ';';

  // Get providers: ChatGPT and Claude
  const providers = [LLMProvider.CHATGPT, LLMProvider.CLAUDE];

  // Build header row with provider names
  const headers = [
    'Date',
    'Part de voix (%)',
    'Position moy.',
    ...providers.map((p) => `Rang ${getDisplayNameForProvider(p)}`),
  ];

  // Build data rows from citationRate time series
  const rows: string[][] = data.citationRate.map((point) => {
    const date = point.date;
    const citationValue = point.value.toFixed(1);

    // Find matching averageRank for this date
    const avgRankPoint = data.averageRank.find((r) => r.date === date);
    const avgRank = avgRankPoint ? avgRankPoint.value.toFixed(1) : '';

    // Build model→provider lookup from modelBreakdown
    const modelToProvider = new Map(data.modelBreakdown.map((m) => [m.model, m.provider]));

    // Find matching rank for each provider (aggregate from models)
    const providerRanks = providers.map((provider) => {
      // Find models belonging to this provider using the lookup map
      const providerModels = Object.keys(data.rankByModel).filter(
        (modelId) => modelToProvider.get(modelId) === provider,
      );

      // Get ranks for this date from all models of this provider
      const ranks: number[] = [];
      for (const model of providerModels) {
        const modelData = data.rankByModel[model];
        const modelPoint = modelData?.find((r) => r.date === date);
        if (modelPoint) ranks.push(modelPoint.value);
      }

      // Average the ranks
      if (ranks.length === 0) return '';
      const avgProviderRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
      return avgProviderRank.toFixed(1);
    });

    return [date, citationValue, avgRank, ...providerRanks];
  });

  // Add empty row before competitors section
  const emptyRow = Array(headers.length).fill('');

  // Competitors section
  const competitorLabels = ['Concurrent', 'Mentions', 'Part de voix (%)', 'Tendance'];
  const competitorRows = data.competitorRanking.map((c) => [
    c.name,
    c.mentions.toString(),
    c.shareOfVoice.toFixed(1),
    c.trend,
  ]);

  // Combine all rows
  const allRows = [headers, ...rows, emptyRow, competitorLabels, ...competitorRows];

  // Convert to CSV string
  const csvContent = BOM + allRows.map((row) => row.join(SEP)).join('\n');

  // Generate filename
  const today = new Date().toISOString().split('T')[0];
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const filename = `coucou-ia-stats-${sanitizedName}-${today}.csv`;

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-48" />
      </div>

      {/* KPIs skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Insight skeleton */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* Chart skeleton */}
      <Skeleton className="h-[300px] w-full rounded-lg" />

      {/* Tables skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>

      {/* Competitors skeleton */}
      <Skeleton className="h-[250px] w-full rounded-lg" />
    </div>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-destructive font-medium text-pretty">
        Erreur lors du chargement des statistiques
      </p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4 mr-2" aria-hidden="true" />
        Réessayer
      </Button>
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <BarChart3 className="size-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
      <p className="font-medium text-pretty">Pas encore de données</p>
      <p className="text-sm mt-1 text-pretty">
        Lancez votre première analyse pour voir les statistiques
      </p>
    </div>
  );
}

const CTA_CONFIG: Record<string, { href: string; label: string }> = {
  recommendations: { href: '#recommendations', label: 'Voir les recommandations' },
  prompts: { href: '#prompts', label: 'Gérer les prompts' },
};

export function StatsContainer({
  projectId,
  userPlan,
  brandName,
  projectName,
  onNavigateToOverview,
}: StatsContainerProps): React.ReactElement {
  const [preset, setPreset] = useState<DatePreset>('30d');

  const dateRange = useMemo(() => getDateRange(preset), [preset]);
  const { data, isLoading, error, refetch } = useHistoricalStats(projectId, dateRange);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (!data) {
    return <EmptyState />;
  }

  const avgCitation =
    data.citationRate.length > 0
      ? data.citationRate.reduce((sum, p) => sum + p.value, 0) / data.citationRate.length
      : 0;

  // Transform HistoricalPromptBreakdown to PromptPerformance
  const promptPerformance: PromptPerformance[] = data.promptBreakdown.map((p) => ({
    promptId: p.promptId,
    content: p.promptText,
    category: p.category as PromptCategory | null,
    citationRate: p.citationRate,
    averageRank: p.averageRank ?? 0,
    trend: p.trend === 'up' ? 5 : p.trend === 'down' ? -5 : 0,
  }));

  const ctaConfig = data.insight.ctaType ? CTA_CONFIG[data.insight.ctaType] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-balance">Statistiques</h2>
          {data.planLimit.isLimited && (
            <Badge variant="muted" className="text-xs">
              {data.planLimit.maxDays} jours max
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker value={preset} onChange={setPreset} userPlan={userPlan} />
          <Button variant="outline" size="sm" onClick={() => generateCSV(data, projectName)}>
            <Download className="size-4 mr-2" aria-hidden="true" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <KpiCardGrid>
        <KpiCard
          label="Part de voix IA"
          value={`${data.summary.citationRate.current.toFixed(1)}%`}
          variation={data.summary.citationRate.variation ?? undefined}
          variationType={getVariationType(data.summary.citationRate.variation)}
          icon={TrendingUp}
          tooltip="Pourcentage de requêtes où votre marque est mentionnée"
        />
        <KpiCard
          label="Position moyenne"
          value={data.summary.averageRank.current.toFixed(1)}
          variation={data.summary.averageRank.variation ?? undefined}
          variationType={getVariationType(data.summary.averageRank.variation)}
          invertColors
          icon={Trophy}
          tooltip="Votre rang moyen quand vous êtes cité (1 = premier)"
        />
        <KpiCard
          label="Analyses totales"
          value={data.summary.totalScans.current}
          variation={data.summary.totalScans.variation ?? undefined}
          variationType={getVariationType(data.summary.totalScans.variation)}
          icon={Radar}
          tooltip="Nombre total d'analyses effectuées sur la période"
        />
        <KpiCard
          label="Benchmark concurrentiel"
          value={data.summary.competitorsCount.current}
          variation={data.summary.competitorsCount.variation ?? undefined}
          variationType={getVariationType(data.summary.competitorsCount.variation)}
          icon={Users}
          tooltip="Marques concurrentes mentionnées sur vos requêtes"
        />
      </KpiCardGrid>

      {/* Insight */}
      {data.insight.message && (
        <InsightCard
          type={data.insight.type}
          message={data.insight.message}
          ctaLabel={ctaConfig?.label}
          ctaHref={ctaConfig?.href}
        />
      )}

      {/* Hero Chart */}
      <CitationRateChart data={data.citationRate} average={avgCitation} />

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProviderPerformanceTable data={data.modelBreakdown} />
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium mb-4 text-balance">Performance par requête</h3>
          <PromptPerformanceTable
            data={promptPerformance}
            onNavigateToOverview={onNavigateToOverview}
          />
        </div>
      </div>

      {/* Competitors */}
      <div>
        <h3 className="text-sm font-medium mb-4 text-balance">Benchmark concurrents</h3>
        <CompetitorRankingTable data={data.competitorRanking} userBrandName={brandName} />
      </div>
    </div>
  );
}
