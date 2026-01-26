'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Radar,
  Plus,
  RefreshCw,
  Trash2,
  MessageSquare,
  BarChart3,
  Lock,
  Users,
  Lightbulb,
  Smile,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { getModelDisplayName } from '@/components/features/dashboard/llm-result-row';
import { AddPromptModal } from '@/components/features/dashboard/add-prompt-modal';
import { StatsContainer, StatsLockedBanner } from '@/components/features/stats';
import { CompetitorsContainer, CompetitorsLockedBanner } from '@/components/features/competitors';
import {
  RecommendationsSummary,
  RecommendationsContainer,
  RecommendationsLockedBanner,
} from '@/components/features/recommendations';
import { SentimentTab } from '@/features/sentiment';
import { getScanAvailability, Plan, PLAN_LIMITS, type PromptCategory } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { NextScanIndicator } from '@/components/dashboard/next-scan-indicator';
import { KpiBentoSection } from '@/components/dashboard/kpi-cards';
import { PulsingDot } from '@/components/ui/pulsing-dot';
import { CitationStatus } from '@/components/dashboard/citation-status';
import { ScanAvailabilityBadge } from '@/components/dashboard/scan-availability-badge';

function formatScanProgress(
  scanProgress: { status?: string; progress?: number } | undefined,
): string {
  if (scanProgress?.status === 'PROCESSING') {
    return `Analyse... ${Math.round((scanProgress.progress ?? 0) * 100)}%`;
  }
  return 'En attente...';
}

function formatFrequency(plan: Plan): string {
  return PLAN_LIMITS[plan].scanFrequency === 'daily' ? 'jour' : 'semaine';
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
  const { triggerScan, isScanning, scanProgress } = useTriggerScan(id);
  const { triggerPromptScan } = useTriggerPromptScan(id);
  const createPrompt = useCreatePrompt(id);
  const deletePrompt = useDeletePrompt(id);

  const userPlan = (user?.plan as Plan) ?? Plan.FREE;

  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [scanningPromptId, setScanningPromptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  async function handleAddPrompt(content: string, category?: PromptCategory): Promise<void> {
    await createPrompt.mutateAsync({ content, category });
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
  const availableModels = Array.from(
    new Set(stats?.promptStats?.flatMap((p) => p.modelResults.map((r) => r.model)) ?? []),
  );
  const hasPrompts = promptCount > 0;

  const scannablePromptIds = new Set(
    stats?.promptStats
      ?.filter((p) => getScanAvailability(p.lastScanAt, userPlan).canScan)
      .map((p) => p.promptId) ?? [],
  );
  const allOnCooldown = hasPrompts && scannablePromptIds.size === 0;

  const userCanAccessStats = userPlan !== Plan.FREE;

  function getScanDisabledReason(): string | null {
    if (isScanning) return null;
    if (!hasPrompts) return 'Ajoutez des prompts pour lancer une analyse';
    if (allOnCooldown) {
      return `Tous les prompts sont en cooldown (1 analyse/${formatFrequency(userPlan)} par prompt)`;
    }
    return null;
  }
  const scanDisabledReason = getScanDisabledReason();
  const isScanDisabled = isScanning || !hasPrompts || allOnCooldown;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
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
            {isScanning ? (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <PulsingDot color="primary" />
                {formatScanProgress(scanProgress)}
              </span>
            ) : stats?.lastScanAt ? (
              <p className="text-xs text-muted-foreground">
                Dernière analyse {formatRelativeTime(stats.lastScanAt)}
              </p>
            ) : null}
          </div>
        </div>
        {userPlan === Plan.FREE ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={isScanDisabled ? 'cursor-not-allowed' : undefined}>
                  <Button
                    onClick={handleTriggerScan}
                    disabled={isScanDisabled}
                    size="sm"
                    className={isScanDisabled ? 'pointer-events-none' : undefined}
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw
                          className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        {formatScanProgress(scanProgress)}
                      </>
                    ) : (
                      <>
                        <Radar className="mr-2 h-4 w-4" aria-hidden="true" />
                        Analyser {scannablePromptIds.size > 0 && `(${scannablePromptIds.size})`}
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {scanDisabledReason && (
                <TooltipContent>
                  <p>{scanDisabledReason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <NextScanIndicator nextAutoScanAt={project.nextAutoScanAt} />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="competitors" className="gap-1.5">
            <Users className="size-3" aria-hidden="true" />
            Concurrents
            {!userCanAccessStats && <Lock className="size-3" aria-hidden="true" />}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1.5">
            <Lightbulb className="size-3" aria-hidden="true" />
            Recommandations
            {!userCanAccessStats && <Lock className="size-3" aria-hidden="true" />}
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5">
            <BarChart3 className="size-3" aria-hidden="true" />
            Statistiques
            {!userCanAccessStats && <Lock className="size-3" aria-hidden="true" />}
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="gap-1.5">
            <Smile className="size-3" aria-hidden="true" />
            Sentiment
            {!userCanAccessStats && <Lock className="size-3" aria-hidden="true" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <KpiBentoSection
            stats={stats}
            projectId={id}
            userPlan={userPlan}
            onNavigateToSentiment={() => setActiveTab('sentiment')}
          />

          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-1">
                  Vos prompts ({promptCount})
                  <InfoTooltip term="prompt" />
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Plan {userPlan} : 1 analyse/prompt/{formatFrequency(userPlan)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddPrompt(true)}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Ajouter
              </Button>
            </div>

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
                        <p className="text-muted-foreground">Aucune requête configurée</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ajoutez des requêtes pour commencer à suivre votre visibilité
                        </p>
                      </td>
                    </tr>
                  ) : (
                    stats?.promptStats.map((prompt) => {
                      const isCitedByAny = prompt.modelResults.some((r) => r.isCited);
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
                            {isCitedByAny && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-success rounded-r" />
                            )}
                            <div className="pl-2">
                              <p className="text-sm">{prompt.content}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {prompt.category && (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">
                                    {prompt.category}
                                  </span>
                                )}
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
                              {userPlan === Plan.FREE && scanAvailability.canScan && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-primary"
                                  onClick={() => handleTriggerPromptScan(prompt.promptId)}
                                  disabled={scanningPromptId === prompt.promptId}
                                  aria-label="Analyser ce prompt"
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

          {recommendationsData?.recommendations && (
            <RecommendationsSummary
              recommendations={recommendationsData.recommendations}
              maxItems={2}
              onViewMore={() => setActiveTab('recommendations')}
            />
          )}

          {stats && (stats.enrichedCompetitors?.length > 0 || stats.topCompetitors?.length > 0) && (
            <CompetitorsList
              competitors={stats.topCompetitors}
              enrichedCompetitors={stats.enrichedCompetitors}
              maxItems={2}
              userPlan={userPlan}
              onViewMore={() => setActiveTab('competitors')}
            />
          )}
        </TabsContent>

        <TabsContent value="competitors">
          {userCanAccessStats ? (
            <CompetitorsContainer
              competitors={stats?.enrichedCompetitors ?? []}
              userPlan={userPlan}
            />
          ) : (
            <CompetitorsLockedBanner />
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {userCanAccessStats ? (
            <RecommendationsContainer
              recommendations={recommendationsData?.recommendations ?? []}
            />
          ) : (
            <RecommendationsLockedBanner />
          )}
        </TabsContent>

        <TabsContent value="stats">
          {userCanAccessStats ? (
            <StatsContainer
              projectId={id}
              userPlan={userPlan}
              brandName={project.brandName}
              projectName={project.brandName}
              onNavigateToOverview={() => setActiveTab('overview')}
            />
          ) : (
            <StatsLockedBanner />
          )}
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentTab projectId={id} userPlan={userPlan} />
        </TabsContent>
      </Tabs>

      <AddPromptModal
        open={showAddPrompt}
        onOpenChange={setShowAddPrompt}
        onSubmit={handleAddPrompt}
        isPending={createPrompt.isPending}
      />

      <AlertDialog
        open={promptToDelete !== null}
        onOpenChange={(open) => !open && setPromptToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette requête ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La requête et son historique d'analyses seront
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
