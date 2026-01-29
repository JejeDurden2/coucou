'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { StepIndicator, BrandInfoStep, PromptGenerationStep } from '@/components/brand-wizard';
import { PlanStep } from './_components/plan-step';

type OnboardingStep = 'plan' | 'brand' | 'prompts';

const STEPS = [
  { id: 'plan', label: 'Plan' },
  { id: 'brand', label: 'Marque' },
  { id: 'prompts', label: 'Requêtes' },
];

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

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <StepIndicator steps={STEPS} currentStepIndex={currentStepIndex} />

        {step === 'plan' && <PlanStep onNext={() => setStep('brand')} />}

        {step === 'brand' && (
          <BrandInfoStep
            onProjectCreated={handleProjectCreated}
            title="Ajoutez votre marque"
            description="Ces informations seront utilisées pour détecter les mentions dans les réponses IA"
          />
        )}

        {step === 'prompts' && createdProjectId && (
          <PromptGenerationStep projectId={createdProjectId} onComplete={navigateToProject} />
        )}
      </div>
    </div>
  );
}
