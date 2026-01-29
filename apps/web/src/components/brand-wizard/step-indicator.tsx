'use client';

export interface StepConfig {
  id: string;
  label: string;
}

interface StepIndicatorProps {
  steps: StepConfig[];
  currentStepIndex: number;
}

export function StepIndicator({ steps, currentStepIndex }: StepIndicatorProps): React.ReactNode {
  const stepNum = currentStepIndex + 1;
  const totalSteps = steps.length;

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, i) => {
        const num = i + 1;
        const isActive = i === currentStepIndex;
        const isDone = i < currentStepIndex;
        return (
          <div key={step.id} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`h-px w-8 ${isDone ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            )}
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isDone
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {num}
            </div>
          </div>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        Étape {stepNum}/{totalSteps}
      </span>
    </div>
  );
}
