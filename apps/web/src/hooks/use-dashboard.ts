'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, ApiClientError } from '@/lib/api-client';

export function useDashboardStats(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'stats'],
    queryFn: () => apiClient.getDashboardStats(projectId),
    enabled: !!projectId,
  });
}

export function useScans(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'scans'],
    queryFn: () => apiClient.getScans(projectId),
    enabled: !!projectId,
  });
}

export function useRecommendations(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'recommendations'],
    queryFn: () => apiClient.getRecommendations(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTriggerScan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.triggerScan(projectId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'scans'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'recommendations'],
      });

      const hasErrors = data.some((scan) => scan.providerErrors?.length);
      const allSkipped = data.every((scan) => scan.skippedReason);

      if (allSkipped && data.length > 0) {
        toast.warning('Scan terminé avec des erreurs', {
          description: 'Tous les prompts ont été ignorés ou ont échoué.',
        });
      } else if (hasErrors) {
        toast.warning('Scan partiel terminé', {
          description: 'Certains fournisseurs LLM ont échoué.',
        });
      } else {
        toast.success('Scan terminé', {
          description: `${data.length} prompt(s) analysé(s) avec succès.`,
        });
      }
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.code === 'ALL_PROVIDERS_FAILED') {
          toast.error('Tous les fournisseurs LLM ont échoué', {
            description: 'Vérifiez la configuration des clés API.',
          });
        } else {
          toast.error('Erreur lors du scan', {
            description: error.message,
          });
        }
      } else {
        toast.error('Erreur lors du scan', {
          description: 'Une erreur inattendue est survenue.',
        });
      }
    },
  });
}
