'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';
import { Plan } from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { useCreateProject } from '@/hooks/use-projects';
import { useCreateCheckout } from '@/hooks/use-billing';
import { PlanGrid } from '@/components/plan-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type OnboardingStep = 'plan' | 'project';

export default function OnboardingPage(): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loadUser } = useAuth();

  // Determine initial step from URL params
  const stepParam = searchParams.get('step');
  const initialStep: OnboardingStep =
    stepParam === 'project' ? 'project' : 'plan';

  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const createCheckout = useCreateCheckout();
  const createProject = useCreateProject();

  // Project form state
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [brandVariants, setBrandVariants] = useState<string[]>([]);

  // If returning from Stripe checkout, refresh user and go to project step
  useEffect(() => {
    if (stepParam === 'project') {
      loadUser();
    }
  }, [stepParam, loadUser]);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setLoadingPlan(plan);

    if (plan === Plan.FREE) {
      // Skip Stripe, go directly to project creation
      setStep('project');
      setLoadingPlan(null);
    } else {
      // Redirect to Stripe checkout
      const baseUrl = window.location.origin;
      createCheckout.mutate({
        plan,
        successUrl: `${baseUrl}/onboarding?step=project`,
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const project = await createProject.mutateAsync({
        name,
        brandName,
        brandVariants,
        domain: domain || undefined,
      });
      router.push(`/projects/${project.id}`);
    } catch {
      // Error handled by mutation
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
        {step === 'plan' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="size-8 text-primary" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-balance">Bienvenue sur Coucou IA</h1>
              <p className="text-muted-foreground text-lg text-pretty">
                Choisissez le plan qui correspond a vos besoins
              </p>
            </div>

            <PlanGrid
              onSelectPlan={handleSelectPlan}
              loadingPlan={loadingPlan}
            />

            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez changer de plan a tout moment depuis les parametres.
            </p>
          </div>
        )}

        {step === 'project' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-balance">Creez votre premier projet</h1>
              <p className="text-muted-foreground text-pretty">
                Configurez le tracking de visibilite pour votre marque
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informations du projet</CardTitle>
                <CardDescription>
                  Ces informations seront utilisees pour detecter les mentions
                  de votre marque dans les reponses IA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nom du projet
                    </label>
                    <Input
                      id="name"
                      placeholder="Ex: Ma Boutique"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Pour vous organiser - non utilise dans les recherches
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="brandName" className="text-sm font-medium">
                      Nom de la marque
                    </label>
                    <Input
                      id="brandName"
                      placeholder="Ex: Cafe Lomi"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      required
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Le nom principal de votre marque a tracker
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
                          <Badge
                            key={variant}
                            variant="secondary"
                            className="gap-1"
                          >
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
                      Autres facons dont votre marque peut etre mentionnee
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="domain" className="text-sm font-medium">
                      Domaine (optionnel)
                    </label>
                    <Input
                      id="domain"
                      inputMode="url"
                      placeholder="Ex: cafelomi.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Sera aussi utilise pour detecter les mentions
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending
                      ? 'Creation...'
                      : 'Creer le projet et commencer'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
