'use client';

import { Sparkles, Loader2, Wand2 } from 'lucide-react';

import { useBrandAnalyze, useBrandJobPolling } from '@/hooks/use-brand-wizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptGenerationStepProps {
  projectId: string;
  onComplete: () => void;
}

export function PromptGenerationStep({
  projectId,
  onComplete,
}: PromptGenerationStepProps): React.ReactNode {
  const analyzeBrand = useBrandAnalyze();
  const brandPolling = useBrandJobPolling({
    projectId,
    onCompleted: () => onComplete(),
    onFailed: () => {
      // Buttons re-enabled automatically when polling stops
    },
  });

  async function handleGenerate(): Promise<void> {
    try {
      const { jobId } = await analyzeBrand.mutateAsync(projectId);
      brandPolling.startPolling(jobId);
    } catch {
      // Error handled by mutation hook toast
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Wand2 className="size-8 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-balance">Générer vos requêtes</h1>
        <p className="text-muted-foreground text-pretty">
          Nous pouvons analyser votre site web pour créer des requêtes de recherche pertinentes
          automatiquement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Génération automatique</CardTitle>
          <CardDescription>
            Notre IA va analyser votre site pour comprendre votre activité et générer des questions
            que vos clients pourraient poser aux assistants IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandPolling.isPolling ? (
            <div className="flex flex-col items-center gap-3 py-4" aria-live="polite">
              <Loader2
                className="size-8 animate-spin motion-reduce:animate-none text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground text-center">
                Analyse de votre site en cours…
                <br />
                Cela peut prendre quelques instants.
              </p>
            </div>
          ) : (
            <>
              <Button
                onClick={handleGenerate}
                disabled={analyzeBrand.isPending}
                className="w-full"
                size="lg"
              >
                {analyzeBrand.isPending ? (
                  <>
                    <Loader2
                      className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Lancement…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 size-4" aria-hidden="true" />
                    Oui, générer mes requêtes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onComplete}
                disabled={analyzeBrand.isPending}
                className="w-full"
                size="lg"
              >
                Non, je les créerai manuellement
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
