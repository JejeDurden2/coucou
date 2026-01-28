'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { useCreateProject } from '@/hooks/use-projects';
import { useGeneratePrompts, useOnboardingJobPolling } from '@/hooks/use-onboarding';
import { useCreateCheckout } from '@/hooks/use-billing';
import { PlanGrid } from '@/components/plan-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type OnboardingStep = 'plan' | 'brand' | 'prompts';

const STEP_NUMBER: Record<OnboardingStep, number> = { plan: 1, brand: 2, prompts: 3 };
const TOTAL_STEPS = 3;

function StepIndicator({ current }: { current: OnboardingStep }) {
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
  const { user, loadUser } = useAuth();

  // Determine initial step from URL params
  const stepParam = searchParams.get('step');
  const initialStep: OnboardingStep = stepParam === 'brand' ? 'brand' : 'plan';

  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const createCheckout = useCreateCheckout();
  const createProject = useCreateProject();
  const generatePrompts = useGeneratePrompts();
  const onboardingPolling = useOnboardingJobPolling({
    projectId: createdProjectId ?? '',
    onCompleted: () => {
      if (createdProjectId) {
        router.push(`/projects/${createdProjectId}`);
      }
    },
    onFailed: () => {
      // Buttons re-enabled automatically when polling stops
    },
  });

  // Brand form state
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [brandVariants, setBrandVariants] = useState<string[]>([]);

  // If returning from Stripe checkout, refresh user and go to brand step
  useEffect(() => {
    if (stepParam === 'brand') {
      loadUser();
    }
  }, [stepParam, loadUser]);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setLoadingPlan(plan);

    if (plan === Plan.FREE) {
      // Skip Stripe, go directly to brand creation
      setStep('brand');
      setLoadingPlan(null);
    } else {
      // Redirect to Stripe checkout
      const baseUrl = window.location.origin;
      createCheckout.mutate({
        plan,
        successUrl: `${baseUrl}/onboarding?step=brand`,
        cancelUrl: `${baseUrl}/onboarding`,
      });
    }
  };

  const addVariant = () => {
    const trimmed = variantInput.trim();
    if (trimmed && !brandVariants.includes(trimmed)) {
      setBrandVariants([...brandVariants, trimmed]);
      setVariantInput('');
    }
  };

  const removeVariant = (variant: string) => {
    setBrandVariants(brandVariants.filter((v) => v !== variant));
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const project = await createProject.mutateAsync({
        name: brandName,
        brandName,
        brandVariants,
        domain,
      });
      setCreatedProjectId(project.id);
      setStep('prompts');
    } catch {
      // Error handled by mutation
    }
  };

  const handleGeneratePrompts = async () => {
    if (!createdProjectId) return;
    try {
      const { jobId } = await generatePrompts.mutateAsync(createdProjectId);
      onboardingPolling.startPolling(jobId);
    } catch {
      // Error handled by mutation hook toast
    }
  };

  const handleSkipPrompts = () => {
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    }
  };

  // If user already has projects, redirect to projects page
  // This is handled by auth redirects, but just in case
  if (user && step === 'plan' && selectedPlan === null) {
    // Show plan selection
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <StepIndicator current={step} />
        {step === 'plan' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="size-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-balance">Bienvenue sur Coucou IA</h1>
              <p className="text-muted-foreground text-lg text-pretty">
                Choisissez le plan qui correspond à vos besoins
              </p>
            </div>

            <PlanGrid onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} />

            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez changer de plan à tout moment depuis les paramètres.
            </p>
          </div>
        )}

        {step === 'brand' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-balance">Ajoutez votre marque</h1>
              <p className="text-muted-foreground text-pretty">
                Ces informations seront utilisées pour détecter les mentions dans les réponses IA
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Votre marque</CardTitle>
                <CardDescription>
                  Renseignez le nom de votre marque et ses variantes pour une surveillance précise.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBrand} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="brandName" className="text-sm font-medium">
                      Nom de la marque
                    </label>
                    <Input
                      id="brandName"
                      placeholder="Ex: Café Lomi"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Le nom principal de votre marque à surveiller
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="domain" className="text-sm font-medium">
                      Site web
                    </label>
                    <Input
                      id="domain"
                      type="url"
                      placeholder="https://cafelomi.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Utilisé pour analyser votre marque et générer des requêtes pertinentes
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="variants" className="text-sm font-medium">
                      Variantes de la marque
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="variants"
                        placeholder="Ex: Lomi Coffee"
                        value={variantInput}
                        onChange={(e) => setVariantInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addVariant();
                          }
                        }}
                        autoComplete="off"
                      />
                      <Button type="button" variant="outline" onClick={addVariant}>
                        Ajouter
                      </Button>
                    </div>
                    {brandVariants.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {brandVariants.map((variant) => (
                          <Badge key={variant} variant="outline" className="gap-1">
                            {variant}
                            <button
                              type="button"
                              onClick={() => removeVariant(variant)}
                              className="ml-1 hover:text-destructive"
                              aria-label={`Supprimer ${variant}`}
                            >
                              <X className="size-3" aria-hidden="true" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Autres façons dont votre marque peut être mentionnée
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createProject.isPending || !domain}
                  >
                    {createProject.isPending ? 'Création...' : 'Continuer'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'prompts' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Wand2 className="size-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-balance">Générer vos requêtes</h1>
              <p className="text-muted-foreground text-pretty">
                Nous pouvons analyser votre site web pour créer des requêtes de recherche
                pertinentes automatiquement.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Génération automatique</CardTitle>
                <CardDescription>
                  Notre IA va analyser votre site pour comprendre votre activité et générer des
                  questions que vos clients pourraient poser aux assistants IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {onboardingPolling.isPolling ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <Loader2
                      className="size-8 animate-spin motion-reduce:animate-none text-primary"
                      aria-hidden="true"
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Analyse de votre site en cours...
                      <br />
                      Cela peut prendre quelques instants.
                    </p>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleGeneratePrompts}
                      disabled={generatePrompts.isPending}
                      className="w-full"
                      size="lg"
                    >
                      {generatePrompts.isPending ? (
                        <>
                          <Loader2
                            className="mr-2 size-4 animate-spin motion-reduce:animate-none"
                            aria-hidden="true"
                          />
                          Lancement...
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
                      onClick={handleSkipPrompts}
                      disabled={generatePrompts.isPending}
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
        )}
      </div>
    </div>
  );
}
