'use client';

import { use, useState, memo } from 'react';
import Link from 'next/link';
import { Play, Plus, RefreshCw, Trash2, Trophy, MessageSquare, BarChart3 } from 'lucide-react';

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
import { CompetitorsList } from '@/components/features/dashboard';
import { StatCard } from '@/components/features/dashboard/stat-card';
import { LLMProvider, type ProviderBreakdown } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';

function getProviderBreakdown(
  breakdown: ProviderBreakdown[] | undefined,
  provider: LLMProvider,
): ProviderBreakdown | undefined {
  return breakdown?.find((b) => b.provider === provider);
}

interface PulsingDotProps {
  color: 'primary' | 'success' | 'cyan' | 'emerald';
  size?: 'sm' | 'md';
}

const DOT_COLORS = {
  primary: { ping: 'bg-primary', dot: 'bg-primary' },
  success: { ping: 'bg-success', dot: 'bg-success' },
  // Legacy
  cyan: { ping: 'bg-chatgpt', dot: 'bg-chatgpt' },
  emerald: { ping: 'bg-success', dot: 'bg-success' },
} as const;

const DOT_SIZES = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
} as const;

function PulsingDot({ color, size = 'sm' }: PulsingDotProps): React.ReactNode {
  const colors = DOT_COLORS[color];
  const sizeClass = DOT_SIZES[size];

  return (
    <span className={cn('relative flex', sizeClass)}>
      <span
        className={cn(
          'animate-ping absolute h-full w-full rounded-full opacity-75 motion-reduce:animate-none',
          colors.ping,
        )}
      />
      <span className={cn('relative rounded-full h-full w-full', colors.dot)} />
    </span>
  );
}

interface ProjectDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDashboardPage({
  params,
}: ProjectDashboardPageProps): React.ReactNode {
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
        <div className="animate-pulse motion-reduce:animate-none text-muted-foreground">
          Chargement…
        </div>
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

  const openaiBreakdown = getProviderBreakdown(stats?.breakdown, LLMProvider.OPENAI);
  const anthropicBreakdown = getProviderBreakdown(stats?.breakdown, LLMProvider.ANTHROPIC);

  const promptCount = stats?.promptStats?.length ?? 0;
  const hasPrompts = promptCount > 0;

  return (
    <div className="space-y-6">
      {/* Header with brand info and scan button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Brand Avatar */}
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary">
              {project.brandName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{project.brandName}</h1>
              {project.brandVariants.length > 0 && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {project.brandVariants.join(', ')}
                </span>
              )}
            </div>
            {/* Scan Status */}
            {triggerScan.isPending ? (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <PulsingDot color="primary" />
                Scan en cours…
              </span>
            ) : stats?.lastScanAt ? (
              <p className="text-xs text-muted-foreground">
                Dernier scan {formatRelativeTime(stats.lastScanAt)}
              </p>
            ) : null}
          </div>
        </div>
        <Button
          onClick={handleTriggerScan}
          disabled={triggerScan.isPending || !hasPrompts}
          size="sm"
        >
          {triggerScan.isPending ? (
            <>
              <RefreshCw
                className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
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
        <StatCard
          icon={Trophy}
          label="Classement moyen"
          value={stats?.averageRank ?? null}
          gradient="gold"
          trend={stats?.trend ? { delta: stats.trend.delta } : undefined}
        />
        <StatCard
          icon={MessageSquare}
          label="ChatGPT"
          value={openaiBreakdown?.averageRank ?? null}
          gradient="chatgpt"
        />
        <StatCard
          icon={MessageSquare}
          label="Claude"
          value={anthropicBreakdown?.averageRank ?? null}
          gradient="claude"
        />
        <StatCard
          icon={BarChart3}
          label="Total scans"
          value={stats?.totalScans?.toString() ?? '0'}
          gradient="primary"
        />
      </div>

      {/* Main Content: Prompts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Vos prompts ({promptCount})
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowAddPrompt(true)}>
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
              <tr className="border-b border-primary/10 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3">
                  Prompt
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 w-28">
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-2 w-2 rounded-full bg-chatgpt" />
                    ChatGPT
                  </span>
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3 w-28">
                  <span className="flex items-center gap-2 justify-center">
                    <span className="h-2 w-2 rounded-full bg-claude" />
                    Claude
                  </span>
                </th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {!hasPrompts ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare
                        className="h-8 w-8 text-primary opacity-50"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-muted-foreground">Aucun prompt configuré</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ajoutez des prompts pour commencer à tracker votre visibilité
                    </p>
                  </td>
                </tr>
              ) : (
                stats?.promptStats.map((prompt) => {
                  const isCitedByAny = prompt.openai?.isCited || prompt.anthropic?.isCited;
                  return (
                    <tr
                      key={prompt.promptId}
                      className={cn(
                        'border-b border-border last:border-0 hover:bg-primary/5 transition-colors relative',
                        (statsLoading || deletePrompt.isPending) && 'opacity-50',
                      )}
                    >
                      <td className="px-4 py-3 relative">
                        {/* Left accent for cited rows */}
                        {isCitedByAny && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-r" />
                        )}
                        <p className="text-sm pl-2">{prompt.content}</p>
                        {prompt.category ? (
                          <span className="ml-2 inline-flex px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                            {prompt.category}
                          </span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Competitors Section */}
      {stats && (stats.enrichedCompetitors?.length > 0 || stats.topCompetitors?.length > 0) ? (
        <CompetitorsList
          competitors={stats.topCompetitors}
          enrichedCompetitors={stats.enrichedCompetitors}
          maxItems={5}
        />
      ) : null}

      {/* Delete Prompt AlertDialog */}
      <AlertDialog
        open={promptToDelete !== null}
        onOpenChange={(open) => !open && setPromptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce prompt ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le prompt et son historique de scans seront
              définitivement supprimés.
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

interface CitationResult {
  isCited: boolean;
  position: number | null;
}

interface CitationStatusProps {
  result: CitationResult | null;
}

const CitationStatus = memo(function CitationStatus({
  result,
}: CitationStatusProps): React.ReactNode {
  if (!result) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (result.isCited) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <PulsingDot color="success" size="md" />
        {result.position !== null && (
          <span className="font-medium tabular-nums text-success text-xs">
            #{result.position}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-destructive">
      <span className="h-3 w-3 rounded-full bg-destructive/20 flex items-center justify-center">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
      </span>
    </span>
  );
});
