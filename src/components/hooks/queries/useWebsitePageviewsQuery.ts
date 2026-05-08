import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export type WebsitePageviewsMetric = 'bouncerate' | 'visitduration';

export interface WebsitePageviewsData {
  pageviews: { x: string; y: number }[];
  sessions: { x: string; y: number }[];
  // Only present when the request asked for the matching metric. Skipping
  // them on the default pageviews request keeps the server from running an
  // extra session-series query on every website-page load.
  bouncerate?: { x: string; y: number }[];
  visitduration?: { x: string; y: number }[];
}

export function useWebsitePageviewsQuery(
  {
    websiteId,
    compare,
    metric,
  }: { websiteId: string; compare?: string; metric?: WebsitePageviewsMetric },
  options?: ReactQueryOptions<WebsitePageviewsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const queryParams = useFilterParameters();

  return useQuery<WebsitePageviewsData>({
    queryKey: [
      'websites:pageviews',
      { websiteId, compare, metric, startAt, endAt, unit, timezone, ...queryParams },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/pageviews`, {
        compare,
        ...(metric && { metric }),
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
