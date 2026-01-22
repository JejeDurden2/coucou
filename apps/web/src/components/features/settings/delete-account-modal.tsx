'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Plan } from '@coucou-ia/shared';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteAccount } from '@/hooks/use-delete-account';

interface DeleteAccountModalProps {
  userPlan: Plan;
  hasActiveSubscription: boolean;
}

type Step = 'warning' | 'confirm';

export function DeleteAccountModal({
  userPlan,
  hasActiveSubscription,
}: DeleteAccountModalProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('warning');
  const [confirmationInput, setConfirmationInput] = useState('');

  const deleteAccount = useDeleteAccount();

  const isConfirmationValid = confirmationInput === 'SUPPRIMER';

  function handleOpenChange(isOpen: boolean): void {
    setOpen(isOpen);
    if (!isOpen) {
      setStep('warning');
      setConfirmationInput('');
    }
  }

  function handleContinue(): void {
    setStep('confirm');
  }

  async function handleDelete(): Promise<void> {
    if (!isConfirmationValid) return;

    try {
      await deleteAccount.mutateAsync({ confirmation: 'SUPPRIMER' });
      toast.success('Votre compte a été supprimé');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error('Erreur', { description: message });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        {step === 'warning' ? (
          <>
            <AlertDialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="text-center">
                Supprimer votre compte ?
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 text-left">
                  <p>Cette action est irréversible. Voici ce qui sera supprimé :</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Tous vos projets et leurs données</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Votre historique de scans et statistiques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-0.5">•</span>
                      <span>Vos prompts et recommandations</span>
                    </li>
                    {hasActiveSubscription && (
                      <li className="flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span>
                        <span>
                          Votre abonnement {userPlan} sera annulé et{' '}
                          <strong className="text-foreground">remboursé au prorata</strong>
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-between">
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <Button variant="destructive" onClick={handleContinue}>
                Continuer
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation finale</AlertDialogTitle>
              <AlertDialogDescription>
                Pour confirmer la suppression définitive de votre compte, tapez{' '}
                <strong className="text-foreground font-mono">SUPPRIMER</strong> ci-dessous.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <label htmlFor="delete-confirmation" className="sr-only">
                Confirmation
              </label>
              <Input
                id="delete-confirmation"
                type="text"
                placeholder="Tapez SUPPRIMER"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="font-mono"
                autoComplete="off"
              />
              {confirmationInput.length > 0 && !isConfirmationValid && (
                <p className="text-sm text-destructive mt-2">
                  Veuillez saisir exactement SUPPRIMER (en majuscules)
                </p>
              )}
            </div>
            <AlertDialogFooter className="sm:justify-between">
              <Button variant="outline" onClick={() => setStep('warning')}>
                Retour
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={!isConfirmationValid || deleteAccount.isPending}
              >
                {deleteAccount.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
