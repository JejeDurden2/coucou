'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuditStatus } from '@coucou-ia/shared';

import { apiClient, ApiClientError } from '@/lib/api-client';

const IN_PROGRESS_STATUSES = new Set<string>([
  AuditStatus.PENDING,
  AuditStatus.PAID,
  AuditStatus.PROCESSING,
]);

export function useLatestAudit(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'audit'],
    queryFn: () => apiClient.getLatestAudit(projectId),
    enabled: !!projectId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && 'status' in data && IN_PROGRESS_STATUSES.has(data.status)) {
        return 10_000;
      }
      return false;
    },
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
