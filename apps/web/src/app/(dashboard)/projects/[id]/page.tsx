'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Play, Plus, RefreshCw, Check, X, Trash2 } from 'lucide-react';

import { useProject } from '@/hooks/use-projects';
import { useCreatePrompt, useDeletePrompt } from '@/hooks/use-prompts';
import { useDashboardStats, useTriggerScan } from '@/hooks/use-dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);

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

  async function handleConfirmDelete(): Promise<void> {
    if (promptToDelete) {
      await deletePrompt.mutateAsync(promptToDelete);
      setPromptToDelete(null);
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
        <p className="text-muted-foreground">Marque non trouvée</p>
        <Button className="mt-4" asChild>
          <Link href="/projects">Retour aux marques</Link>
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
      {/* Header with brand info and scan button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{project.brandName}</h1>
            {project.brandVariants.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {project.brandVariants.join(', ')}
              </span>
            )}
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
        <RankCard
          label="Classement moyen"
          value={stats?.averageRank ?? null}
        />
        <RankCard
          label="ChatGPT"
          value={openaiBreakdown?.averageRank ?? null}
        />
        <RankCard
          label="Claude"
          value={anthropicBreakdown?.averageRank ?? null}
        />
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total scans</p>
          <p className="text-2xl font-semibold tabular-nums">{stats?.totalScans ?? 0}</p>
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
                        className="size-8 text-muted-foreground hover:text-red-500"
                        onClick={() => setPromptToDelete(prompt.promptId)}
                        aria-label="Supprimer ce prompt"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
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
                <span className="text-xs text-muted-foreground tabular-nums">({competitor.count})</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Delete Prompt AlertDialog */}
      <AlertDialog open={promptToDelete !== null} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce prompt ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le prompt et son historique de scans seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface RankCardProps {
  label: string;
  value: number | null;
}

function RankCard({ label, value }: RankCardProps): React.ReactNode {
  const hasValue = value !== null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {hasValue ? (
        <p className="text-2xl font-semibold tabular-nums">
          <span className="text-lg text-muted-foreground">#</span>
          {value.toFixed(1)}
        </p>
      ) : (
        <p className="text-2xl font-semibold text-muted-foreground">—</p>
      )}
    </div>
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
        <Check className="size-4" aria-hidden="true" />
        {result.position ? (
          <span className="text-xs font-medium tabular-nums">#{result.position}</span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-red-500">
      <X className="size-4" aria-hidden="true" />
    </span>
  );
}
