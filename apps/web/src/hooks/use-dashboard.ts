'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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

export function useTriggerScan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.triggerScan(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'scans'],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'stats'],
      });
    },
  });
}
