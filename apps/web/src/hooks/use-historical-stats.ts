import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface DateRange {
  start: string;
  end: string;
}

export function useHistoricalStats(projectId: string, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['projects', projectId, 'historical', dateRange],
    queryFn: () => apiClient.getHistoricalStats(projectId, dateRange?.start, dateRange?.end),
    enabled: !!projectId,
  });
}
