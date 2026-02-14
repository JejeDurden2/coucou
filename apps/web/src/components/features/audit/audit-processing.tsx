'use client';

import { Check } from 'lucide-react';
import { AuditStatus } from '@coucou-ia/shared';

import { cn } from '@/lib/utils';

interface AuditProcessingProps {
  status:
    | AuditStatus.PAID
    | AuditStatus.CRAWLING
    | AuditStatus.ANALYZING;
  pagesAnalyzedClient: number | null;
  competitorsAnalyzed: string[];
}

interface StepState {
  label: string;
  sublabel?: string;
  state: 'done' | 'active' | 'pending';
}

function getSteps(
  status: AuditProcessingProps['status'],
  pagesAnalyzedClient: number | null,
  competitorsAnalyzed: string[],
): StepState[] {
  const isAnalyzing = status === AuditStatus.ANALYZING;
  const isCrawling = status === AuditStatus.CRAWLING;

  const crawlSublabel = isAnalyzing
    ? `${pagesAnalyzedClient ?? 0} pages analysées, ${competitorsAnalyzed.length} concurrents`
    : undefined;

  return [
    {
      label: 'Paiement confirmé',
      state: 'done',
    },
    {
      label: isCrawling ? 'Analyse du site en cours' : 'Analyse du site',
      sublabel: crawlSublabel,
      state: isAnalyzing ? 'done' : isCrawling ? 'active' : 'pending',
    },
    {
      label: 'Rédaction du rapport',
      state: isAnalyzing ? 'active' : 'pending',
    },
    {
      label: 'Génération du PDF',
      state: 'pending',
    },
  ];
}

export function AuditProcessing({
  status,
  pagesAnalyzedClient,
  competitorsAnalyzed,
}: AuditProcessingProps): React.ReactNode {
  const steps = getSteps(status, pagesAnalyzedClient, competitorsAnalyzed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Audit en cours</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Notre agent IA analyse votre site et vos concurrents.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Vous recevrez un email quand le rapport sera prêt.
        </p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const isDone = step.state === 'done';
          const isActive = step.state === 'active';
          const isPending = step.state === 'pending';

          return (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border-2',
                    isDone && 'border-primary bg-primary text-primary-foreground',
                    isActive && 'border-primary bg-transparent',
                    isPending && 'border-muted-foreground/30 bg-transparent',
                  )}
                >
                  {isDone ? (
                    <Check className="size-4" />
                  ) : isActive ? (
                    <div className="size-2.5 rounded-full bg-primary animate-pulse motion-reduce:animate-none" />
                  ) : (
                    <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-8',
                      isDone ? 'bg-primary' : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>

              <div className="pb-8 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isPending && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
