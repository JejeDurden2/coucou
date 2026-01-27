'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Send, ImagePlus, X } from 'lucide-react';
import {
  Plan,
  SUPPORT_CATEGORIES,
  SUPPORT_MAX_SCREENSHOT_SIZE,
  supportRequestSchema,
  type SupportCategory,
} from '@coucou-ia/shared';

import { useAuth } from '@/lib/auth-context';
import { useSendSupportRequest } from '@/hooks/use-support';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function SupportPage(): React.ReactNode {
  const { user } = useAuth();
  const sendSupport = useSendSupportRequest();

  const [category, setCategory] = useState<SupportCategory>('bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user?.plan === Plan.FREE) {
    return (
      <div className="max-w-lg space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-balance">Support</h1>
          <p className="text-sm text-muted-foreground mt-1 text-pretty">Contactez notre équipe</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="size-6 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-semibold text-balance">Besoin d&apos;aide ?</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            Consultez notre FAQ pour trouver des réponses à vos questions. Le support par email est
            disponible à partir du plan Solo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/faq">Consulter la FAQ</Link>
            </Button>
            <Button asChild>
              <Link href="/billing">Passer au plan Solo</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtitle =
    user?.plan === Plan.PRO
      ? 'Notre équipe vous répond sous 24h'
      : 'Notre équipe vous répond rapidement';

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > SUPPORT_MAX_SCREENSHOT_SIZE) {
      setErrors((prev) => ({ ...prev, screenshot: 'Le fichier ne doit pas dépasser 5 Mo' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
      setScreenshotName(file.name);
      setErrors(({ screenshot: _, ...rest }) => rest);
    };
    reader.readAsDataURL(file);
  }

  function removeScreenshot(): void {
    setScreenshot(null);
    setScreenshotName(null);
  }

  function resetForm(): void {
    setCategory('bug');
    setSubject('');
    setMessage('');
    setScreenshot(null);
    setScreenshotName(null);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setErrors({});

    const payload = {
      category,
      subject: subject.trim(),
      message: message.trim(),
      ...(screenshot && { screenshot }),
    };

    const result = supportRequestSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues
          .filter((issue) => typeof issue.path[0] === 'string')
          .map((issue) => [issue.path[0], issue.message]),
      );
      setErrors(fieldErrors);
      return;
    }

    sendSupport.mutate(result.data, {
      onSuccess: () => resetForm(),
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-balance">Contacter le support</h1>
        <p className="text-sm text-muted-foreground mt-1 text-pretty">{subtitle}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Catégorie */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className={cn(
                'flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm',
                'text-foreground ring-offset-background',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/40',
              )}
            >
              {(Object.entries(SUPPORT_CATEGORIES) as [SupportCategory, string][]).map(
                ([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ),
              )}
            </select>
            {errors.category && (
              <p role="alert" className="text-sm text-destructive text-pretty">
                {errors.category}
              </p>
            )}
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </label>
            <Input
              id="subject"
              name="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Résumez votre demande…"
              maxLength={200}
            />
            {errors.subject && (
              <p role="alert" className="text-sm text-destructive text-pretty">
                {errors.subject}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre problème en détail…"
              className={cn(
                'w-full min-h-[160px] rounded-lg border bg-card px-3 py-2 text-sm',
                'text-foreground placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/40',
                'resize-none border-border',
                errors.message && 'border-destructive focus-visible:ring-destructive',
              )}
              maxLength={5000}
            />
            <div className="flex items-center justify-between text-xs">
              {errors.message ? (
                <p role="alert" className="text-destructive text-pretty">
                  {errors.message}
                </p>
              ) : (
                <span className="text-muted-foreground">10 caractères minimum</span>
              )}
              <span className="text-muted-foreground tabular-nums">{message.length}/5000</span>
            </div>
          </div>

          {/* Screenshot */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Capture d&apos;écran{' '}
              <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
            </label>
            {screenshot ? (
              <div className="relative rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshot}
                    alt="Aperçu de la capture"
                    className="size-16 rounded-md object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{screenshotName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                    aria-label="Supprimer la capture"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="screenshot-input"
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-dashed border-border',
                  'bg-muted/30 px-4 py-3 cursor-pointer',
                  'hover:border-primary/40 hover:bg-muted/50 transition-colors',
                )}
              >
                <ImagePlus className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                  Ajouter une capture d&apos;écran (max 5 Mo)
                </span>
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="sr-only"
                />
              </label>
            )}
            {errors.screenshot && (
              <p role="alert" className="text-sm text-destructive text-pretty">
                {errors.screenshot}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={sendSupport.isPending} className="w-full sm:w-auto">
            <Send className="mr-2 size-4" aria-hidden="true" />
            {sendSupport.isPending ? 'Envoi en cours\u2026' : 'Envoyer'}
          </Button>
        </form>
      </div>
    </div>
  );
}
