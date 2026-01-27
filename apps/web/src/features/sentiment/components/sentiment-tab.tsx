'use client';

import { memo, useMemo } from 'react';
import { Loader2, Brain, Calendar } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { Card, CardContent } from '@/components/ui/card';
import { useLatestSentiment } from '@/hooks/use-sentiment';
import { formatRelativeTime, formatRelativeTimeFuture } from '@/lib/format';

import { SentimentLockedBanner } from './sentiment-locked-banner';
import { ScoreCard } from './score-card';
import { ThemesBadges } from './themes-badges';
import { SentimentChart } from './sentiment-chart';
import { KeywordsList } from './keywords-list';

interface SentimentTabProps {
  projectId: string;
  userPlan: Plan;
}

export const SentimentTab = memo(function SentimentTab({ projectId, userPlan }: SentimentTabProps) {
  const { data, isLoading, error } = useLatestSentiment(projectId);

  const scan = data?.scan;
  const gpt = scan?.results.gpt;
  const claude = scan?.results.claude;

  // Merge all unique themes and keywords from both providers
  const mergedData = useMemo(
    () =>
      gpt && claude
        ? {
            themes: [...new Set([...gpt.t, ...claude.t])],
            positiveKeywords: [...new Set([...gpt.kp, ...claude.kp])],
            negativeKeywords: [...new Set([...gpt.kn, ...claude.kn])],
          }
        : null,
    [gpt, claude],
  );

  // Locked state for FREE users
  if (userPlan === Plan.FREE) {
    return <SentimentLockedBanner />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="size-6 animate-spin motion-reduce:animate-none text-muted-foreground"
          aria-hidden="true"
        />
        <span className="ml-2 text-muted-foreground">Chargement de l'analyse sentiment...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erreur lors du chargement de l'analyse sentiment
      </div>
    );
  }

  // Empty state - no scan yet
  if (!scan || !mergedData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <Brain className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-balance">Aucune analyse de sentiment</h3>
              <p className="text-sm text-muted-foreground max-w-md text-pretty">
                L'analyse sentiment sera effectuée automatiquement lors de la prochaine analyse
                hebdomadaire.
              </p>
            </div>
            {data?.nextScanDate && (
              <p className="text-xs text-muted-foreground text-pretty">
                Prochaine analyse : {formatRelativeTimeFuture(data.nextScanDate)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { nextScanDate } = data;
  const { themes, positiveKeywords, negativeKeywords } = mergedData;

  return (
    <div className="space-y-6">
      {/* Scores by LLM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ScoreCard provider="gpt" score={scan.results.gpt.s} themes={scan.results.gpt.t} />
        <ScoreCard provider="claude" score={scan.results.claude.s} themes={scan.results.claude.t} />
      </div>

      {/* Combined themes */}
      <ThemesBadges themes={themes} />

      {/* Sentiment evolution chart */}
      <SentimentChart projectId={projectId} />

      {/* Keywords lists */}
      <KeywordsList positive={positiveKeywords} negative={negativeKeywords} />

      {/* Scan dates */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" aria-hidden="true" />
              <span>Dernière analyse : {formatRelativeTime(scan.scannedAt)}</span>
            </div>
            {nextScanDate && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4" aria-hidden="true" />
                <span>Prochaine analyse : {formatRelativeTimeFuture(nextScanDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
