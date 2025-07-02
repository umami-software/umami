import { UseQueryOptions } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';

export interface WebsiteStatsData {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  previous: {
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
  const filterParams = useFilterParams(websiteId);

  return useQuery<WebsiteStatsData>({
    queryKey: ['websites:stats', { websiteId, ...filterParams }],
    queryFn: () => get(`/websites/${websiteId}/stats`, { ...filterParams }),
    enabled: !!websiteId,
    ...options,
  });
}
