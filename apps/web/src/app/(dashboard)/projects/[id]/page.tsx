'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Plus, RefreshCw, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { usePrompts, useCreatePrompt, useDeletePrompt } from '@/hooks/use-prompts';
import { useDashboardStats, useTriggerScan } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard, PromptTable, CompetitorsList } from '@/components/features/dashboard';
import { LLMProvider } from '@coucou-ia/shared';

export default function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: prompts } = usePrompts(id);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(id);
  const triggerScan = useTriggerScan(id);
  const createPrompt = useCreatePrompt(id);
  const deletePrompt = useDeletePrompt(id);

  const [newPrompt, setNewPrompt] = useState('');
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim()) return;

    await createPrompt.mutateAsync({ content: newPrompt.trim() });
    setNewPrompt('');
    setShowAddPrompt(false);
  };

  const handleTriggerScan = async () => {
    await triggerScan.mutateAsync();
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (confirm('Supprimer ce prompt ?')) {
      await deletePrompt.mutateAsync(promptId);
    }
  };

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
    (b) => b.provider === LLMProvider.OPENAI,
  );
  const anthropicBreakdown = stats?.breakdown.find(
    (b) => b.provider === LLMProvider.ANTHROPIC,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild aria-label="Retour aux projets">
            <Link href="/projects">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">
              Tracking: {project.brandName}
              {project.brandVariants.length > 0 &&
                `, ${project.brandVariants.join(', ')}`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleTriggerScan}
            disabled={triggerScan.isPending || !prompts?.length}
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
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Score global"
          value={`${Math.round(stats?.globalScore ?? 0)}%`}
          icon={Target}
          trend={
            stats?.trend
              ? { value: stats.trend.delta, isPositive: stats.trend.delta >= 0 }
              : undefined
          }
        />
        <StatCard
          label="ChatGPT"
          value={`${Math.round(openaiBreakdown?.citationRate ?? 0)}%`}
          icon={BarChart3}
        />
        <StatCard
          label="Claude"
          value={`${Math.round(anthropicBreakdown?.citationRate ?? 0)}%`}
          icon={BarChart3}
        />
        <StatCard
          label="Total scans"
          value={stats?.totalScans ?? 0}
          icon={TrendingUp}
        />
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prompts table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Prompts trackés</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddPrompt(true)}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Ajouter un prompt
            </Button>
          </div>

          {showAddPrompt && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleAddPrompt} className="flex gap-3">
                  <Input
                    placeholder="Ex: Quels sont les meilleurs cafés à Paris ?"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="flex-1"
                    autoComplete="off"
                    aria-label="Contenu du prompt"
                  />
                  <Button type="submit" disabled={createPrompt.isPending}>
                    Ajouter
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddPrompt(false)}
                  >
                    Annuler
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <PromptTable
            prompts={stats?.promptStats ?? []}
            onDelete={handleDeletePrompt}
            isLoading={statsLoading || deletePrompt.isPending}
          />
        </div>

        {/* Competitors */}
        <div>
          <CompetitorsList competitors={stats?.topCompetitors ?? []} />
        </div>
      </div>
    </div>
  );
}
