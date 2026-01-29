'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { StepIndicator, BrandInfoStep, PromptGenerationStep } from '@/components/brand-wizard';

type WizardStep = 'brand-info' | 'prompt-generation';

const STEPS = [
  { id: 'brand-info', label: 'Marque' },
  { id: 'prompt-generation', label: 'Requêtes' },
];

export default function NewBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('brand-info');
  const [projectId, setProjectId] = useState<string | null>(null);

  function handleProjectCreated(id: string): void {
    setProjectId(id);
    setStep('prompt-generation');
  }

  function handleComplete(): void {
    if (projectId) {
      router.push(`/projects/${projectId}`);
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild aria-label="Retour aux marques">
            <Link href="/projects">
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <div className="flex-1">
            <StepIndicator steps={STEPS} currentStepIndex={currentStepIndex} />
          </div>
        </div>

        {step === 'brand-info' && (
          <BrandInfoStep
            onProjectCreated={handleProjectCreated}
            title="Nouvelle marque"
            description="Configurez le tracking de visibilité pour votre marque"
          />
        )}

        {step === 'prompt-generation' && projectId && (
          <PromptGenerationStep projectId={projectId} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
