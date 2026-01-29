'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { OnboardingJobStatusResponse } from '@coucou-ia/shared';

import { apiClient, ApiClientError } from '@/lib/api-client';

const TERMINAL_STATUSES = new Set(['completed', 'failed']);

function isTerminalStatus(status: string | undefined): boolean {
  return status !== undefined && TERMINAL_STATUSES.has(status);
}

export function useBrandAnalyze() {
  return useMutation({
    mutationFn: (projectId: string) => apiClient.analyzeBrand(projectId),
    onError: (error) => {
      const description =
        error instanceof ApiClientError && error.message
          ? error.message
          : 'Vous pouvez créer vos requêtes manuellement.';
      toast.error('Erreur de génération', { description });
    },
  });
}

export interface BrandJobPollingOptions {
  projectId: string;
  onCompleted?: (data: OnboardingJobStatusResponse) => void;
  onFailed?: (data: OnboardingJobStatusResponse) => void;
}

export interface BrandJobPollingResult {
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
  isPolling: boolean;
  jobStatus: OnboardingJobStatusResponse | undefined;
}

export function useBrandJobPolling(options: BrandJobPollingOptions): BrandJobPollingResult {
  const { projectId } = options;
  const queryClient = useQueryClient();
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  // Store callbacks in refs to avoid effect re-subscriptions
  const onCompletedRef = useRef(options.onCompleted);
  const onFailedRef = useRef(options.onFailed);
  onCompletedRef.current = options.onCompleted;
  onFailedRef.current = options.onFailed;

  const statusQuery = useQuery({
    queryKey: ['brand-job', projectId, pollingJobId],
    queryFn: () => apiClient.getBrandJobStatus(projectId, pollingJobId!),
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
      onCompletedRef.current?.(data);
      invalidateAndReset();
    } else if (data.status === 'failed') {
      toast.error('Erreur de génération', {
        description: 'Vous pouvez réessayer ou créer vos requêtes manuellement.',
      });
      onFailedRef.current?.(data);
      invalidateAndReset();
    }
  }, [statusQuery.data, pollingJobId, invalidateAndReset]);

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
