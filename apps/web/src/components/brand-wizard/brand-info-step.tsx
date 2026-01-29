'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import { useCreateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BrandInfoStepProps {
  onProjectCreated: (projectId: string) => void;
  title?: string;
  description?: string;
}

export function BrandInfoStep({
  onProjectCreated,
  title = 'Ajoutez votre marque',
  description = 'Ces informations seront utilisées pour détecter les mentions dans les réponses IA',
}: BrandInfoStepProps): React.ReactNode {
  const createProject = useCreateProject();

  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [brandVariants, setBrandVariants] = useState<string[]>([]);

  function addVariant(): void {
    const trimmed = variantInput.trim();
    if (trimmed && !brandVariants.includes(trimmed)) {
      setBrandVariants([...brandVariants, trimmed]);
      setVariantInput('');
    }
  }

  function removeVariant(variant: string): void {
    setBrandVariants(brandVariants.filter((v) => v !== variant));
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    try {
      const project = await createProject.mutateAsync({
        name: brandName,
        brandName,
        brandVariants,
        domain,
      });
      onProjectCreated(project.id);
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-balance">{title}</h1>
        <p className="text-muted-foreground text-pretty">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre marque</CardTitle>
          <CardDescription>
            Renseignez le nom de votre marque et ses variantes pour une surveillance précise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              {createProject.isPending ? 'Création…' : 'Continuer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
