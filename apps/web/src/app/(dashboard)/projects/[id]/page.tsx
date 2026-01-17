'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Play, Plus, RefreshCw, Check, X, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

import { useProject } from '@/hooks/use-projects';
import { useCreatePrompt, useDeletePrompt } from '@/hooks/use-prompts';
import { useDashboardStats, useTriggerScan } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LLMProvider } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';

interface ProjectDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDashboardPage({ params }: ProjectDashboardPageProps): React.ReactNode {
  const { id } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(id);
  const triggerScan = useTriggerScan(id);
  const createPrompt = useCreatePrompt(id);
  const deletePrompt = useDeletePrompt(id);

  const [newPrompt, setNewPrompt] = useState('');
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  async function handleAddPrompt(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    await createPrompt.mutateAsync({ content: newPrompt.trim() });
    setNewPrompt('');
    setShowAddPrompt(false);
  }

  async function handleTriggerScan(): Promise<void> {
    await triggerScan.mutateAsync();
  }

  async function handleDeletePrompt(promptId: string): Promise<void> {
    if (confirm('Supprimer ce prompt ?')) {
      await deletePrompt.mutateAsync(promptId);
    }
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projet non trouvé</p>
        <Button className="mt-4" asChild>
          <Link href="/projects">Retour aux projets</Link>
        </Button>
      </div>
    );
  }

  const openaiBreakdown = stats?.breakdown.find(
    (b) => b.provider === LLMProvider.OPENAI
  );
  const anthropicBreakdown = stats?.breakdown.find(
    (b) => b.provider === LLMProvider.ANTHROPIC
  );

  const promptCount = stats?.promptStats?.length ?? 0;
  const hasPrompts = promptCount > 0;

  return (
    <div className="space-y-6">
      {/* Header with project info and scan button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <span className="text-sm text-muted-foreground">
              {project.brandName}
              {project.brandVariants.length > 0 && ` · ${project.brandVariants.join(', ')}`}
            </span>
          </div>
          {stats?.lastScanAt ? (
            <p className="text-xs text-muted-foreground mt-1">
              Dernier scan: {new Date(stats.lastScanAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          ) : null}
        </div>
        <Button
          onClick={handleTriggerScan}
          disabled={triggerScan.isPending || !hasPrompts}
          size="sm"
        >
          {triggerScan.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Scan en cours…
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              Lancer un scan
            </>
          )}
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ScoreCard
          label="Score global"
          value={stats?.globalScore ?? 0}
          trend={stats?.trend?.delta}
          isPercentage
        />
        <ScoreCard
          label="ChatGPT"
          value={openaiBreakdown?.citationRate ?? 0}
          isPercentage
        />
        <ScoreCard
          label="Claude"
          value={anthropicBreakdown?.citationRate ?? 0}
          isPercentage
        />
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total scans</p>
          <p className="text-2xl font-semibold">{stats?.totalScans ?? 0}</p>
        </div>
      </div>

      {/* Main Content: Prompts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Vos prompts ({promptCount})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPrompt(true)}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Ajouter
          </Button>
        </div>

        {/* Add Prompt Form */}
        {showAddPrompt ? (
          <form onSubmit={handleAddPrompt} className="flex gap-2">
            <Input
              placeholder="Ex: Quels sont les meilleurs cafés à Paris…"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="flex-1"
              autoComplete="off"
              aria-label="Nouveau prompt à tracker"
            />
            <Button type="submit" disabled={createPrompt.isPending} size="sm">
              Ajouter
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddPrompt(false);
                setNewPrompt('');
              }}
            >
              Annuler
            </Button>
          </form>
        ) : null}

        {/* Prompts Table */}
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">
                  Prompt
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 w-24">
                  ChatGPT
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 w-24">
                  Claude
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {!hasPrompts ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <p className="text-muted-foreground">Aucun prompt configuré</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajoutez des prompts pour commencer à tracker votre visibilité
                    </p>
                  </td>
                </tr>
              ) : (
                stats?.promptStats.map((prompt) => (
                  <tr
                    key={prompt.promptId}
                    className={cn(
                      'border-b border-border last:border-0 hover:bg-muted/30 transition-colors',
                      (statsLoading || deletePrompt.isPending) && 'opacity-50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm">{prompt.content}</p>
                      {prompt.category ? (
                        <span className="text-xs text-muted-foreground">{prompt.category}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CitationStatus result={prompt.openai} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CitationStatus result={prompt.anthropic} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleDeletePrompt(prompt.promptId)}
                        aria-label="Supprimer ce prompt"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitors Section */}
      {stats?.topCompetitors && stats.topCompetitors.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Concurrents détectés
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.topCompetitors.slice(0, 8).map((competitor) => (
              <span
                key={competitor.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm"
              >
                {competitor.name}
                <span className="text-xs text-muted-foreground">({competitor.count})</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  value: number;
  trend?: number;
  isPercentage?: boolean;
}

function ScoreCard({ label, value, trend, isPercentage }: ScoreCardProps): React.ReactNode {
  const displayValue = Math.round(value);
  const hasTrend = trend !== undefined && trend !== 0;
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-semibold">
          {displayValue}
          {isPercentage && <span className="text-lg">%</span>}
        </p>
        {hasTrend ? (
          <TrendIndicator value={trend} isPositive={isPositive} />
        ) : null}
      </div>
    </div>
  );
}

interface TrendIndicatorProps {
  value: number;
  isPositive: boolean;
}

function TrendIndicator({ value, isPositive }: TrendIndicatorProps): React.ReactNode {
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-500' : 'text-red-500';
  const prefix = isPositive ? '+' : '';

  return (
    <span className={cn('inline-flex items-center text-xs font-medium', colorClass)}>
      <Icon className="h-3 w-3 mr-0.5" aria-hidden="true" />
      {prefix}{Math.round(value)}%
    </span>
  );
}

interface CitationResult {
  isCited: boolean;
  position: number | null;
}

interface CitationStatusProps {
  result: CitationResult | null;
}

function CitationStatus({ result }: CitationStatusProps): React.ReactNode {
  if (!result) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (result.isCited) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-500">
        <Check className="h-4 w-4" aria-hidden="true" />
        {result.position ? (
          <span className="text-xs font-medium">#{result.position}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-500">
      <X className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}
