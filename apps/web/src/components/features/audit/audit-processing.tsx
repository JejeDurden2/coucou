'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AuditProcessingProps {
  paidAt: string | null;
  startedAt: string | null;
}

interface Step {
  label: string;
  estimatedDuration: string;
}

const STEPS: Step[] = [
  { label: 'Paiement confirmé', estimatedDuration: '' },
  { label: 'Analyse de votre site', estimatedDuration: '~2 min' },
  { label: 'Analyse de vos concurrents', estimatedDuration: '~1 min' },
  { label: 'Génération du rapport', estimatedDuration: '~1 min' },
];

function getActiveStepIndex(elapsedSeconds: number): number {
  if (elapsedSeconds < 30) return 1;
  if (elapsedSeconds < 60) return 2;
  return 3;
}

export function AuditProcessing({ paidAt, startedAt }: AuditProcessingProps): React.ReactNode {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const referenceDate = startedAt ?? paidAt;
    if (!referenceDate) return;

    const start = new Date(referenceDate).getTime();

    function update(): void {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [paidAt, startedAt]);

  const activeStepIndex = getActiveStepIndex(elapsedSeconds);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Audit en cours</h1>
        <p className="text-muted-foreground mt-2 text-pretty">
          Résultats dans quelques minutes. Vous pouvez rester sur cette page.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Vous recevrez aussi un email si vous quittez.
        </p>
      </div>

      <div className="space-y-0">
        {STEPS.map((step, index) => {
          const isDone = index < activeStepIndex;
          const isActive = index === activeStepIndex;
          const isPending = index > activeStepIndex;

          return (
            <div key={step.label} className="flex gap-4">
              {/* Vertical line + icon */}
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
                    <div className="size-2.5 rounded-full bg-primary" />
                  ) : (
                    <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-8',
                      isDone ? 'bg-primary' : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pb-8 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isPending && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {step.estimatedDuration && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.estimatedDuration}
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
