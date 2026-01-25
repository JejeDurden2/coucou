'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient, ApiClientError } from '@/lib/api-client';

export function useGeneratePrompts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => apiClient.generateOnboardingPrompts(projectId),
    onSuccess: (data, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'prompts'] });
      toast.success('Requêtes générées', {
        description: `${data.prompts.length} requêtes créées automatiquement.`,
      });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur de génération', {
          description: error.message || "Impossible d'analyser votre site.",
        });
      } else {
        toast.error('Erreur de génération', {
          description: 'Vous pouvez créer vos requêtes manuellement.',
        });
      }
    },
  });
}
