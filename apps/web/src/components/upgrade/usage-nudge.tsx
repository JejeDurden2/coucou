'use client';

import { memo, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUpgradeModal } from '@/hooks/use-upgrade';

type NudgeType = 'project-limit' | 'prompt-limit' | 'scan-complete' | 'model-teaser';

interface NudgeConfig {
  message: string;
  cta: string;
  feature: 'stats' | 'competitors' | 'recommendations' | 'sentiment';
}

function getNudgeConfig(type: NudgeType, context?: NudgeContext): NudgeConfig | null {
  switch (type) {
    case 'project-limit':
      return {
        message: `Limite atteinte (${context?.current ?? 0}/${context?.max ?? 0} marque${(context?.max ?? 0) > 1 ? 's' : ''}). Passez à Solo pour suivre jusqu'à 5 marques.`,
        cta: 'Passer à Solo',
        feature: 'stats',
      };
    case 'prompt-limit':
      return {
        message: `Limite atteinte (${context?.current ?? 0}/${context?.max ?? 0} prompts). Passez à Solo pour 10 prompts par marque.`,
        cta: 'Passer à Solo',
        feature: 'stats',
      };
    case 'scan-complete':
      return {
        message:
          'Analyse terminée ! Débloquez les statistiques détaillées, le suivi de vos concurrents et les recommandations.',
        cta: 'Voir ce que Solo débloque',
        feature: 'stats',
      };
    case 'model-teaser':
      return {
        message: 'Résultats GPT-4o-mini uniquement. Ajoutez GPT-4o et Claude Sonnet avec Solo.',
        cta: 'Débloquer',
        feature: 'stats',
      };
    default:
      return null;
  }
}

interface NudgeContext {
  current?: number;
  max?: number;
}

interface UsageNudgeProps {
  type: NudgeType;
  context?: NudgeContext;
  className?: string;
}

export const UsageNudge = memo(function UsageNudge({ type, context, className }: UsageNudgeProps) {
  const { openUpgradeModal } = useUpgradeModal();
  const [dismissed, setDismissed] = useState(false);

  const config = getNudgeConfig(type, context);
  if (!config || dismissed) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3',
        className,
      )}
    >
      <Sparkles className="size-4 text-primary shrink-0" aria-hidden="true" />
      <p className="text-sm text-foreground flex-1 text-pretty">{config.message}</p>
      <Button
        size="sm"
        variant="default"
        onClick={() => openUpgradeModal(config.feature)}
        className="shrink-0"
      >
        {config.cta}
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Fermer"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
});
