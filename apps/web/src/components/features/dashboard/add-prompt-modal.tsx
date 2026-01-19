'use client';

import { useState } from 'react';
import { Lightbulb, Target, HelpCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAX_CHARS = 500;
const MIN_CHARS = 5;

interface AddPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (content: string) => Promise<void>;
  isPending: boolean;
}

export function AddPromptModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddPromptModalProps): React.ReactNode {
  const [content, setContent] = useState('');
  const charCount = content.length;
  const isValidLength = charCount >= MIN_CHARS && charCount <= MAX_CHARS;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!isValidLength || isPending) return;

    await onSubmit(content.trim());
    setContent('');
  }

  function handleOpenChange(newOpen: boolean): void {
    if (!newOpen) {
      setContent('');
    }
    onOpenChange(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Ajouter un prompt</DialogTitle>
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
              <span className="text-muted-foreground">
                {MIN_CHARS} caractères minimum
              </span>
              <span
                className={cn(
                  'tabular-nums',
                  charCount > MAX_CHARS
                    ? 'text-destructive'
                    : charCount > MAX_CHARS * 0.9
                      ? 'text-amber-500'
                      : 'text-muted-foreground',
                )}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* GEO Tips */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="size-4 text-amber-500" aria-hidden="true" />
              Conseils pour un bon prompt GEO
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Target className="size-4 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <span>
                  <strong className="text-foreground">Soyez spécifique</strong> — Incluez votre
                  secteur, localisation ou cas d&apos;usage précis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle
                  className="size-4 mt-0.5 text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-foreground">Posez une vraie question</strong> — Formulez
                  comme un utilisateur réel qui cherche une solution
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2
                  className="size-4 mt-0.5 text-primary flex-shrink-0"
                  aria-hidden="true"
                />
                <span>
                  <strong className="text-foreground">Évitez les marques</strong> — Ne mentionnez
                  pas votre marque dans le prompt pour des résultats objectifs
                </span>
              </li>
            </ul>
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
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
              {isPending ? 'Ajout…' : 'Ajouter le prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
