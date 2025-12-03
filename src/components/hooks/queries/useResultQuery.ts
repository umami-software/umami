import { useDateParameters } from '@/components/hooks/useDateParameters';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';

export function useResultQuery<T = any>(
  type: string,
  params?: Record<string, any>,
  options?: ReactQueryOptions<T>,
) {
  const { websiteId, ...parameters } = params;
  const { post, useQuery } = useApi();
  const { startDate, endDate, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<T>({
    queryKey: [
      'reports',
      {
        type,
        websiteId,
        startDate,
        endDate,
        timezone,
        ...params,
        ...filters,
      },
    ],
    queryFn: () =>
      post(`/reports/${type}`, {
        websiteId,
        type,
        filters,
        parameters: {
          startDate,
          endDate,
          timezone,
          ...parameters,
        },
      }),
    enabled: !!type,
    ...options,
  });
}
