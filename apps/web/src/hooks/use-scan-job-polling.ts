'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScanJobStatusResponse } from '@coucou-ia/shared';
import { apiClient } from '@/lib/api-client';

const TERMINAL_STATUSES = ['COMPLETED', 'PARTIAL', 'FAILED'] as const;

function isTerminalStatus(status: string | undefined): boolean {
  return (
    status !== undefined && TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number])
  );
}

export interface ScanJobPollingOptions {
  projectId: string;
  onCompleted?: (data: ScanJobStatusResponse) => void;
  onPartial?: (data: ScanJobStatusResponse) => void;
  onFailed?: (data: ScanJobStatusResponse) => void;
}

export interface ScanJobPollingResult {
  startPolling: (jobId: string) => void;
  stopPolling: () => void;
  isPolling: boolean;
  scanProgress: ScanJobStatusResponse | undefined;
}

export function useScanJobPolling(options: ScanJobPollingOptions): ScanJobPollingResult {
  const { projectId, onCompleted, onPartial, onFailed } = options;
  const queryClient = useQueryClient();
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['scan-job', projectId, pollingJobId],
    queryFn: () => apiClient.getScanJobStatus(projectId, pollingJobId!),
    enabled: !!pollingJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (isTerminalStatus(status)) {
        return false;
      }
      return 2000;
    },
  });

  const invalidateAndReset = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'scans'] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'recommendations'] });
    setPollingJobId(null);
  }, [queryClient, projectId]);

  useEffect(() => {
    const data = statusQuery.data;
    if (!data || !pollingJobId) return;

    if (data.status === 'COMPLETED') {
      onCompleted?.(data);
      invalidateAndReset();
    } else if (data.status === 'PARTIAL') {
      onPartial?.(data);
      invalidateAndReset();
    } else if (data.status === 'FAILED') {
      onFailed?.(data);
      invalidateAndReset();
    }
  }, [statusQuery.data, pollingJobId, invalidateAndReset, onCompleted, onPartial, onFailed]);

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
    scanProgress: statusQuery.data,
  };
}
