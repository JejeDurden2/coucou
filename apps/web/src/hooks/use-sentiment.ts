import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

export function useLatestSentiment(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'sentiment', 'latest'],
    queryFn: () => apiClient.getLatestSentiment(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSentimentHistory(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'sentiment', 'history'],
    queryFn: () => apiClient.getSentimentHistory(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
