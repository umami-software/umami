import { UseQueryOptions } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '@/components/hooks/useDateParameters';

export interface WebsiteStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
}

export function useWebsiteStatsQuery(
  websiteId: string,
  options?: UseQueryOptions<WebsiteStatsData, Error, WebsiteStatsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<WebsiteStatsData>({
    queryKey: ['websites:stats', { websiteId, startAt, endAt, unit, timezone, ...filters }],
    queryFn: () =>
      get(`/websites/${websiteId}/stats`, { startAt, endAt, unit, timezone, ...filters }),
    enabled: !!websiteId,
    ...options,
  });
}
