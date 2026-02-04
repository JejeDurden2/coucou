'use client';

import { useState } from 'react';
import { Lightbulb, Target, HelpCircle, CheckCircle2, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PROMPT_CATEGORIES, type PromptCategory } from '@coucou-ia/shared';
import { cn } from '@/lib/utils';

const MAX_CHARS = 500;
const MIN_CHARS = 5;

function getCharCountColor(count: number, max: number): string {
  if (count > max) return 'text-destructive';
  if (count > max * 0.9) return 'text-warning';
  return 'text-muted-foreground';
}

interface AddPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string, category?: PromptCategory) => Promise<void>;
  isPending: boolean;
}

export function AddPromptModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddPromptModalProps): React.ReactNode {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PromptCategory>();
  const charCount = content.length;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!isValidLength || isPending) return;

    await onSubmit(content.trim(), category);
    setContent('');
    setCategory(undefined);
  }

  function handleOpenChange(newOpen: boolean): void {
    if (!newOpen) {
      setContent('');
      setCategory(undefined);
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-balance">Ajouter une requête</DialogTitle>
          <DialogDescription className="text-pretty">
            Entrez une question que vos clients pourraient poser à une IA pour trouver un service
            comme le vôtre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ex: Quels sont les meilleurs cafés pour travailler à Paris ?"
                className={cn(
                  'w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  'resize-none',
                  charCount > MAX_CHARS && 'border-destructive focus:ring-destructive',
                )}
                maxLength={MAX_CHARS + 50}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{MIN_CHARS} caractères minimum</span>
              <span className={cn('tabular-nums', getCharCountColor(charCount, MAX_CHARS))}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Category selector (optional) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">Catégorie</span>
              <span className="text-xs text-muted-foreground">(optionnel)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(category === cat ? undefined : cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm border',
                    category === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:border-primary hover:text-primary',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* GEO Tips */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="size-4 text-warning" aria-hidden="true" />
              Conseils pour une bonne requête
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Target className="size-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-foreground">Soyez spécifique</strong> : incluez votre
                  secteur, localisation ou cas d&apos;usage précis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle
                  className="size-4 mt-0.5 text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-foreground">Posez une vraie question</strong> : formulez
                  comme un utilisateur réel qui cherche une solution
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="size-4 mt-0.5 text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-foreground">Évitez les marques</strong> : ne mentionnez
                  pas votre marque dans la requête pour des résultats objectifs
                </span>
              </li>
            </ul>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-pretty">
                <strong className="text-foreground">Exemples :</strong>
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                <li>• &quot;Quel CRM choisir pour une startup B2B en France ?&quot;</li>
                <li>• &quot;Meilleur outil de gestion de projet pour équipes remote&quot;</li>
                <li>• &quot;Comment trouver un bon avocat en droit des affaires à Lyon ?&quot;</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!isValidLength || isPending}>
              {isPending ? 'Ajout…' : 'Ajouter la requête'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
