import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export type WebsiteExpandedMetricsData = {
  label: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}[];

export function useWebsiteExpandedMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number; search?: string },
  options?: ReactQueryOptions<WebsiteExpandedMetricsData>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return useQuery<WebsiteExpandedMetricsData>({
    queryKey: [
      'websites:metrics:expanded',
      {
        websiteId,
        ...date,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics/expanded`, {
        ...date,
        ...filters,
        ...params,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
