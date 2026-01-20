'use client';

import { use, useState, memo } from 'react';
import Link from 'next/link';
import {
  Radar,
  Plus,
  RefreshCw,
  Trash2,
  Trophy,
  MessageSquare,
  BarChart3,
  EyeOff,
  Clock,
  CheckCircle2,
  Lock,
} from 'lucide-react';

import { useProject } from '@/hooks/use-projects';
import { useCreatePrompt, useDeletePrompt } from '@/hooks/use-prompts';
import {
  useDashboardStats,
  useRecommendations,
  useTriggerScan,
  useTriggerPromptScan,
} from '@/hooks/use-dashboard';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CompetitorsList, RecommendationsPanel } from '@/components/features/dashboard';
import { StatCard } from '@/components/features/dashboard/stat-card';
import { getModelDisplayName } from '@/components/features/dashboard/llm-result-row';
import { AddPromptModal } from '@/components/features/dashboard/add-prompt-modal';
import { StatsContainer, StatsLockedBanner } from '@/components/features/stats';
import { LLMProvider, getScanAvailability, Plan, PLAN_LIMITS } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatRelativeTimeFuture } from '@/lib/format';

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
  sm: 'size-2',
  md: 'size-3',
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
  const { user } = useAuth();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: stats, isLoading: statsLoading } = useDashboardStats(id);
  const { data: recommendationsData } = useRecommendations(id);
  const triggerScan = useTriggerScan(id);
  const triggerPromptScan = useTriggerPromptScan(id);
  const createPrompt = useCreatePrompt(id);
  const deletePrompt = useDeletePrompt(id);

  const userPlan = (user?.plan as Plan) ?? Plan.FREE;

  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [scanningPromptId, setScanningPromptId] = useState<string | null>(null);

  async function handleAddPrompt(content: string): Promise<void> {
    await createPrompt.mutateAsync({ content });
    setShowAddPrompt(false);
  }

  async function handleTriggerScan(): Promise<void> {
    await triggerScan.mutateAsync();
  }

  async function handleTriggerPromptScan(promptId: string): Promise<void> {
    setScanningPromptId(promptId);
    try {
      await triggerPromptScan.mutateAsync(promptId);
    } finally {
      setScanningPromptId(null);
    }
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

  const promptCount = stats?.promptStats?.length ?? 0;
  const modelBreakdown = stats?.modelBreakdown ?? [];
  // Get unique models from all prompt results for table columns
  const availableModels = Array.from(
    new Set(stats?.promptStats?.flatMap((p) => p.modelResults.map((r) => r.model)) ?? []),
  );
  const hasPrompts = promptCount > 0;

  // Calculate scannable prompts (not on cooldown)
  const scannablePromptIds = new Set(
    stats?.promptStats
      ?.filter((p) => getScanAvailability(p.lastScanAt, userPlan).canScan)
      .map((p) => p.promptId) ?? [],
  );
  const allOnCooldown = hasPrompts && scannablePromptIds.size === 0;

  const userCanAccessStats = userPlan !== Plan.FREE;

  return (
    <div className="space-y-6">
      {/* Header with brand info and scan button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Brand Avatar */}
          <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
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
          disabled={triggerScan.isPending || !hasPrompts || allOnCooldown}
          size="sm"
          title={allOnCooldown ? 'Tous les prompts sont en période de cooldown' : undefined}
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
              <Radar className="mr-2 h-4 w-4" aria-hidden="true" />
              Scanner {scannablePromptIds.size > 0 && `(${scannablePromptIds.size})`}
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            Statistiques
            {!userCanAccessStats && <Lock className="size-3" aria-hidden="true" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={Trophy}
              label="Rang moyen"
              value={stats?.averageRank ?? null}
              gradient="gold"
              trend={stats?.trend ? { delta: stats.trend.delta } : undefined}
              sparklineData={stats?.trends?.averageRank?.map((p) => p.value)}
              podiumStyle
            />
            {modelBreakdown.map((model) => (
              <StatCard
                key={model.model}
                icon={MessageSquare}
                label={getModelDisplayName(model.model)}
                value={model.averageRank}
                gradient={model.provider === LLMProvider.OPENAI ? 'chatgpt' : 'claude'}
                podiumStyle
              />
            ))}
            <StatCard
              icon={BarChart3}
              label="Total scans"
              value={stats?.totalScans?.toString() ?? '0'}
              gradient="primary"
            />
          </div>

          {/* Main Content: Prompts Table */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase">
                  Vos prompts ({promptCount})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plan {userPlan} : 1 scan/prompt/{PLAN_LIMITS[userPlan].scanFrequency === 'daily' ? 'jour' : 'semaine'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddPrompt(true)}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter
              </Button>
            </div>

            {/* Prompts Table */}
            <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase px-4 py-3">
                      Prompt
                    </th>
                    {availableModels.map((model) => (
                      <th
                        key={model}
                        className="text-center text-xs font-medium text-muted-foreground uppercase px-4 py-3 w-24"
                      >
                        {getModelDisplayName(model)}
                      </th>
                    ))}
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {!hasPrompts ? (
                    <tr>
                      <td colSpan={availableModels.length + 2} className="px-4 py-12 text-center">
                        <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
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
                      const isCitedByAny = prompt.modelResults.some((r) => r.isCited);
                      // Build a Map for O(1) lookups instead of find() in loop
                      const resultsByModel = new Map(prompt.modelResults.map((r) => [r.model, r]));
                      const scanAvailability = getScanAvailability(prompt.lastScanAt, userPlan);
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
                            <div className="pl-2">
                              <p className="text-sm">{prompt.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {prompt.category ? (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                                    {prompt.category}
                                  </span>
                                ) : null}
                                <ScanAvailabilityBadge
                                  lastScanAt={prompt.lastScanAt}
                                  canScan={scanAvailability.canScan}
                                  nextAvailableAt={scanAvailability.nextAvailableAt}
                                  plan={userPlan}
                                />
                              </div>
                            </div>
                          </td>
                          {availableModels.map((model) => (
                            <td key={model} className="px-4 py-3 text-center">
                              <CitationStatus result={resultsByModel.get(model) ?? null} />
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {scanAvailability.canScan && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-primary"
                                  onClick={() => handleTriggerPromptScan(prompt.promptId)}
                                  disabled={scanningPromptId === prompt.promptId}
                                  aria-label="Scanner ce prompt"
                                >
                                  {scanningPromptId === prompt.promptId ? (
                                    <RefreshCw
                                      className="size-4 animate-spin motion-reduce:animate-none"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Radar className="size-4" aria-hidden="true" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-red-500"
                                onClick={() => setPromptToDelete(prompt.promptId)}
                                aria-label="Supprimer ce prompt"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations Section */}
          {recommendationsData?.recommendations && recommendationsData.recommendations.length > 0 ? (
            <RecommendationsPanel recommendations={recommendationsData.recommendations} />
          ) : null}

          {/* Competitors Section */}
          {stats && (stats.enrichedCompetitors?.length > 0 || stats.topCompetitors?.length > 0) ? (
            <CompetitorsList
              competitors={stats.topCompetitors}
              enrichedCompetitors={stats.enrichedCompetitors}
              maxItems={5}
              userPlan={userPlan}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="stats">
          {userCanAccessStats ? (
            <StatsContainer projectId={id} userPlan={userPlan} />
          ) : (
            <StatsLockedBanner />
          )}
        </TabsContent>
      </Tabs>

      {/* Add Prompt Modal */}
      <AddPromptModal
        open={showAddPrompt}
        onOpenChange={setShowAddPrompt}
        onSubmit={handleAddPrompt}
        isPending={createPrompt.isPending}
      />

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
    return (
      <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" aria-label="Pas encore scanné" />
    );
  }

  if (result.isCited) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <PulsingDot color="success" size="md" />
        {result.position !== null && (
          <span className="font-medium tabular-nums text-success text-xs">#{result.position}</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-destructive">
      <span className="size-3 rounded-full bg-destructive/20 flex items-center justify-center">
        <span className="size-1.5 rounded-full bg-destructive" />
      </span>
    </span>
  );
});

interface ScanAvailabilityBadgeProps {
  lastScanAt: Date | null;
  canScan: boolean;
  nextAvailableAt: Date | null;
  plan: Plan;
}

const ScanAvailabilityBadge = memo(function ScanAvailabilityBadge({
  lastScanAt,
  canScan,
  nextAvailableAt,
  plan,
}: ScanAvailabilityBadgeProps): React.ReactNode {
  const frequency = PLAN_LIMITS[plan].scanFrequency === 'daily' ? 'jour' : 'semaine';

  // Never scanned
  if (lastScanAt === null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">
        <Clock className="size-3" aria-hidden="true" />
        Jamais scanné
      </span>
    );
  }

  // Can scan now
  if (canScan) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-success/10 text-success">
        <CheckCircle2 className="size-3" aria-hidden="true" />
        Scan disponible
      </span>
    );
  }

  // On cooldown
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600"
      title={`1 scan/${frequency} - Prochain scan ${nextAvailableAt ? formatRelativeTimeFuture(nextAvailableAt) : ''}`}
    >
      <Clock className="size-3" aria-hidden="true" />
      {nextAvailableAt ? formatRelativeTimeFuture(nextAvailableAt) : `1/${frequency}`}
    </span>
  );
});
