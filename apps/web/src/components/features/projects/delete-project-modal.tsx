'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteProject } from '@/hooks/use-projects';

interface DeleteProjectModalProps {
  projectId: string;
  brandName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteProjectModal({
  projectId,
  brandName,
  open,
  onOpenChange,
}: DeleteProjectModalProps): React.ReactNode {
  const router = useRouter();
  const [confirmationInput, setConfirmationInput] = useState('');
  const deleteProject = useDeleteProject();

  const isConfirmationValid = confirmationInput === brandName;

  function handleOpenChange(isOpen: boolean): void {
    onOpenChange(isOpen);
    if (!isOpen) {
      setConfirmationInput('');
    }
  }

  async function handleDelete(): Promise<void> {
    if (!isConfirmationValid) return;

    try {
      await deleteProject.mutateAsync(projectId);
      toast.success('Marque supprimée', {
        description: `"${brandName}" a été supprimée définitivement.`,
      });
      router.push('/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error('Erreur', { description: message });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-center">Supprimer « {brandName} » ?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p>
                Cette action est irréversible. Toutes les données associées seront définitivement
                supprimées :
              </p>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>Tous les prompts et scans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>L'historique et les statistiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>Les analyses de sentiment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>Les recommandations</span>
                </li>
              </ul>
              <p className="pt-2">
                Pour confirmer, tapez{' '}
                <strong className="text-foreground font-mono">{brandName}</strong> ci-dessous.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <label htmlFor="delete-project-confirmation" className="sr-only">
            Confirmation
          </label>
          <Input
            id="delete-project-confirmation"
            type="text"
            placeholder={`Tapez ${brandName}`}
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            className="font-mono"
            autoComplete="off"
          />
          {confirmationInput.length > 0 && !isConfirmationValid && (
            <p className="text-sm text-destructive mt-2 text-pretty">
              Veuillez saisir exactement le nom de la marque
            </p>
          )}
        </div>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || deleteProject.isPending}
          >
            {deleteProject.isPending ? (
              <>
                <div className="mr-2 animate-spin motion-reduce:animate-none">
                  <Loader2 className="size-4" aria-hidden="true" />
                </div>
                Suppression…
              </>
            ) : (
              'Supprimer définitivement'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
