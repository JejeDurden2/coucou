'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreatePromptInput, UpdatePromptInput } from '@coucou-ia/shared';
import { apiClient } from '@/lib/api-client';

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
    mutationFn: (data: CreatePromptInput) =>
      apiClient.createPrompt(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
    },
  });
}

export function useUpdatePrompt(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promptId,
      data,
    }: {
      promptId: string;
      data: UpdatePromptInput;
    }) => apiClient.updatePrompt(projectId, promptId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
    },
  });
}

export function useDeletePrompt(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promptId: string) =>
      apiClient.deletePrompt(projectId, promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'prompts'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
    },
  });
}
