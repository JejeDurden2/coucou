'use client';

import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ScanJobStatusResponse } from '@coucou-ia/shared';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { useScanJobPolling } from './use-scan-job-polling';

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
  const onCompleted = useCallback((data: ScanJobStatusResponse) => {
    toast.success('Scan terminé', {
      description: `${data.successCount} prompt(s) analysé(s) avec succès.`,
    });
  }, []);

  const onPartial = useCallback((data: ScanJobStatusResponse) => {
    toast.warning('Scan partiel terminé', {
      description: `${data.successCount} succès, ${data.failureCount} échec(s).`,
    });
  }, []);

  const onFailed = useCallback((data: ScanJobStatusResponse) => {
    toast.error('Scan échoué', {
      description: data.errorMessage || 'Une erreur est survenue.',
    });
  }, []);

  const { startPolling, isPolling, scanProgress } = useScanJobPolling({
    projectId,
    onCompleted,
    onPartial,
    onFailed,
  });

  const triggerMutation = useMutation({
    mutationFn: () => apiClient.triggerScan(projectId),
    onSuccess: (data) => {
      if (data.totalPrompts === 0) {
        toast.warning('Aucun prompt à scanner');
        return;
      }
      toast.info('Scan lancé', { description: 'Vous serez notifié des résultats.' });
      startPolling(data.jobId);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.code === 'ALL_PROVIDERS_FAILED') {
          toast.error('Tous les fournisseurs LLM ont échoué', {
            description: 'Vérifiez la configuration des clés API.',
          });
        } else if (error.code === 'SCAN_LIMIT_EXCEEDED') {
          toast.warning('Limite de scans atteinte', {
            description: error.message,
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

  const isScanning = triggerMutation.isPending || isPolling;

  return {
    triggerScan: triggerMutation,
    isScanning,
    scanProgress,
  };
}

export function useTriggerPromptScan(projectId: string) {
  const onCompleted = useCallback(() => {
    toast.success('Scan terminé', {
      description: 'Le prompt a été analysé avec succès.',
    });
  }, []);

  const onPartial = useCallback(() => {
    toast.warning('Scan partiel terminé', {
      description: 'Certains fournisseurs LLM ont échoué.',
    });
  }, []);

  const onFailed = useCallback((data: ScanJobStatusResponse) => {
    toast.error('Scan échoué', {
      description: data.errorMessage || 'Une erreur est survenue.',
    });
  }, []);

  const { startPolling, isPolling, scanProgress } = useScanJobPolling({
    projectId,
    onCompleted,
    onPartial,
    onFailed,
  });

  const triggerMutation = useMutation({
    mutationFn: (promptId: string) => apiClient.triggerPromptScan(promptId),
    onSuccess: (data) => {
      toast.info('Scan lancé', { description: 'Vous serez notifié des résultats.' });
      startPolling(data.jobId);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        if (error.code === 'ALL_PROVIDERS_FAILED') {
          toast.error('Tous les fournisseurs LLM ont échoué', {
            description: 'Vérifiez la configuration des clés API.',
          });
        } else if (error.code === 'SCAN_COOLDOWN' || error.code === 'VALIDATION_ERROR') {
          toast.warning('Scan impossible', {
            description: 'Ce prompt est en période de cooldown.',
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

  const isScanning = triggerMutation.isPending || isPolling;

  return {
    triggerPromptScan: triggerMutation,
    isScanning,
    scanProgress,
  };
}
