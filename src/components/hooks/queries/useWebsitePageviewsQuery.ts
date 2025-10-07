import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export interface WebsitePageviewsData {
  pageviews: { x: string; y: number }[];
  sessions: { x: string; y: number }[];
}

export function useWebsitePageviewsQuery(
  { websiteId, compare }: { websiteId: string; compare?: string },
  options?: ReactQueryOptions<WebsitePageviewsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const queryParams = useFilterParameters();

  return useQuery<WebsitePageviewsData>({
    queryKey: [
      'websites:pageviews',
      { websiteId, compare, startAt, endAt, unit, timezone, ...queryParams },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/pageviews`, {
        compare,
        startAt,
        endAt,
        unit,
        timezone,
        ...queryParams,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
