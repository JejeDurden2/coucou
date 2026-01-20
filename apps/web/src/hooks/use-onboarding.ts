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
      toast.success('Prompts générés', {
        description: `${data.prompts.length} prompts créés automatiquement.`,
      });
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur de génération', {
          description: error.message || "Impossible d'analyser votre site.",
        });
      } else {
        toast.error('Erreur de génération', {
          description: 'Vous pouvez créer vos prompts manuellement.',
        });
      }
    },
  });
}
