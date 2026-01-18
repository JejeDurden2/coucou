'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { useCreateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function NewBrandPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [variantInput, setVariantInput] = useState('');
  const [brandVariants, setBrandVariants] = useState<string[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const project = await createProject.mutateAsync({
        name: brandName,
        brandName,
        brandVariants,
        domain: domain || undefined,
      });
      router.push(`/projects/${project.id}`);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Retour aux marques">
          <Link href="/projects">
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nouvelle marque</h1>
          <p className="text-muted-foreground">
            Configurez le tracking de visibilité pour votre marque
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre marque</CardTitle>
          <CardDescription>
            Renseignez le nom de votre marque et ses variantes pour un tracking précis.
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
                Le nom principal de votre marque à tracker
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="variants" className="text-sm font-medium">
                Variantes (optionnel)
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
                    <Badge key={variant} variant="secondary" className="gap-1">
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
                Sera aussi utilisé pour détecter les mentions
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={createProject.isPending}
              >
                {createProject.isPending ? 'Création…' : 'Ajouter la marque'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Annuler</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
