import { keepPreviousData } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export type WebsiteExpandedMetricsData = {
  name: string;
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
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<WebsiteExpandedMetricsData>({
    queryKey: [
      'websites:metrics:expanded',
      {
        websiteId,
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/metrics/expanded`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...params,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
