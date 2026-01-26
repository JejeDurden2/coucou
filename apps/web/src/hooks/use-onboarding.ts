'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { OnboardingJobStatusResponse } from '@coucou-ia/shared';

import { apiClient, ApiClientError } from '@/lib/api-client';

const TERMINAL_STATUSES = ['completed', 'failed'] as const;

function isTerminalStatus(status: string | undefined): boolean {
  return (
    status !== undefined && TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number])
  );
}

export function useGeneratePrompts() {
  return useMutation({
    mutationFn: (projectId: string) => apiClient.generateOnboardingPrompts(projectId),
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

export interface OnboardingJobPollingOptions {
  projectId: string;
  onCompleted?: (data: OnboardingJobStatusResponse) => void;
  onFailed?: (data: OnboardingJobStatusResponse) => void;
}

export interface OnboardingJobPollingResult {
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
  isPolling: boolean;
  jobStatus: OnboardingJobStatusResponse | undefined;
}

export function useOnboardingJobPolling(
  options: OnboardingJobPollingOptions,
): OnboardingJobPollingResult {
  const { projectId, onCompleted, onFailed } = options;
  const queryClient = useQueryClient();
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['onboarding-job', pollingJobId],
    queryFn: () => apiClient.getOnboardingJobStatus(pollingJobId!),
    enabled: !!pollingJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (isTerminalStatus(status)) {
        return false;
      }
      return 3000;
    },
  });

  const invalidateAndReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'prompts'] });
    setPollingJobId(null);
  }, [queryClient, projectId]);

  useEffect(() => {
    const data = statusQuery.data;
    if (!data || !pollingJobId) return;

    if (data.status === 'completed') {
      const promptsCreated = data.result?.promptsCreated ?? 0;
      toast.success('Requêtes générées', {
        description: `${promptsCreated} requêtes créées automatiquement.`,
      });
      onCompleted?.(data);
      invalidateAndReset();
    } else if (data.status === 'failed') {
      toast.error('Erreur de génération', {
        description: 'Vous pouvez réessayer ou créer vos requêtes manuellement.',
      });
      onFailed?.(data);
      invalidateAndReset();
    }
  }, [statusQuery.data, pollingJobId, invalidateAndReset, onCompleted, onFailed]);

  const startPolling = useCallback((jobId: string) => {
    setPollingJobId(jobId);
  }, []);

  const stopPolling = useCallback(() => {
    setPollingJobId(null);
  }, []);

  const isPolling = !!pollingJobId && !isTerminalStatus(statusQuery.data?.status);

  return {
    startPolling,
    stopPolling,
    isPolling,
    jobStatus: statusQuery.data,
  };
}
