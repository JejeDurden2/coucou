'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { PlanStep } from './_components/plan-step';
import { BrandStep } from './_components/brand-step';
import { PromptsStep } from './_components/prompts-step';

type OnboardingStep = 'plan' | 'brand' | 'prompts';

const STEP_NUMBER: Record<OnboardingStep, number> = { plan: 1, brand: 2, prompts: 3 };
const TOTAL_STEPS = 3;

function StepIndicator({ current }: { current: OnboardingStep }): React.ReactNode {
  const stepNum = STEP_NUMBER[current];
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const num = i + 1;
        const isActive = num === stepNum;
        const isDone = num < stepNum;
        return (
          <div key={num} className="flex items-center gap-2">
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
        Étape {stepNum}/{TOTAL_STEPS}
      </span>
    </div>
  );
}

export default function OnboardingPage(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loadUser } = useAuth();

  const stepParam = searchParams.get('step');
  const initialStep: OnboardingStep = stepParam === 'brand' ? 'brand' : 'plan';

  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (stepParam === 'brand') {
      loadUser();
    }
  }, [stepParam, loadUser]);

  function handleProjectCreated(projectId: string): void {
    setCreatedProjectId(projectId);
    setStep('prompts');
  }

  function navigateToProject(): void {
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <StepIndicator current={step} />
        {step === 'plan' && <PlanStep onNext={() => setStep('brand')} />}
        {step === 'brand' && <BrandStep onProjectCreated={handleProjectCreated} />}
        {step === 'prompts' && createdProjectId && (
          <PromptsStep projectId={createdProjectId} onComplete={navigateToProject} />
        )}
      </div>
    </div>
  );
}
