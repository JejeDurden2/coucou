'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuditStatus } from '@coucou-ia/shared';

import { apiClient, ApiClientError } from '@/lib/api-client';

const IN_PROGRESS_STATUSES = new Set<string>([
  AuditStatus.PAID,
  AuditStatus.PROCESSING,
  AuditStatus.CRAWLING,
  AuditStatus.ANALYZING,
]);

const POLL_INTERVAL_MS = 10_000;
const FAST_POLL_INTERVAL_MS = 2_000;

export function useLatestAudit(projectId: string, fastPoll = false) {
  return useQuery({
    queryKey: ['projects', projectId, 'audit'],
    queryFn: () => apiClient.getLatestAudit(projectId),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && 'status' in data && IN_PROGRESS_STATUSES.has(data.status)) {
        return POLL_INTERVAL_MS;
      }
      if (fastPoll) return FAST_POLL_INTERVAL_MS;
      return false;
    },
  });
}

export function useAuditReportUrl(
  projectId: string,
  auditId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['projects', projectId, 'audit', auditId, 'report-url'],
    queryFn: () => apiClient.getAuditReportUrl(projectId, auditId!),
    enabled: enabled && !!auditId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useCreateAuditCheckout(projectId: string) {
  return useMutation({
    mutationFn: () => apiClient.createAuditCheckout(projectId),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      const description =
        error instanceof ApiClientError
          ? error.message
          : 'Impossible de créer la session de paiement.';
      toast.error('Erreur', { description });
    },
  });
}
