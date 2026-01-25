'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreatePromptInput, UpdatePromptInput } from '@coucou-ia/shared';
import { apiClient, ApiClientError } from '@/lib/api-client';

export function usePrompts(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'prompts'],
    queryFn: () => apiClient.getPrompts(projectId),
    enabled: !!projectId,
  });
}

export function useCreatePrompt(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptInput) => apiClient.createPrompt(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
      toast.success('Requête créée');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.code === 'PLAN_LIMIT_EXCEEDED') {
          toast.error('Limite atteinte', {
            description: 'Passez à un plan supérieur pour créer plus de requêtes.',
          });
        } else {
          toast.error('Erreur', { description: error.message });
        }
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}

export function useUpdatePrompt(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promptId, data }: { promptId: string; data: UpdatePromptInput }) =>
      apiClient.updatePrompt(projectId, promptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
      toast.success('Requête mise à jour');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}

export function useDeletePrompt(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: string) => apiClient.deletePrompt(projectId, promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
      toast.success('Requête supprimée');
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        toast.error('Erreur', { description: error.message });
      } else {
        toast.error('Erreur', { description: 'Une erreur inattendue est survenue.' });
      }
    },
  });
}
