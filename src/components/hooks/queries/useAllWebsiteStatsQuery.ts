import { useApi } from '../useApi';
import { type OverviewRange, RANGE_MS, getRangeBucketMs } from './useWebsiteSummaryQuery';

export type SortField = 'name' | 'visitors' | 'pageviews';

interface WebsiteStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

const CONCURRENCY = 5;

async function batchedFetch<T>(
  items: string[],
  fn: (id: string) => Promise<T>,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

export function useAllWebsiteStatsQuery(
  websiteIds: string[],
  range: OverviewRange,
  enabled = true,
) {
  const { get, useQuery } = useApi();

  const bucketMs = getRangeBucketMs(range);
  const bucket = Math.floor(Date.now() / bucketMs);

  return useQuery<Record<string, WebsiteStats>>({
    queryKey: ['websites:all-stats', { ids: websiteIds, range, bucket }],
    queryFn: async () => {
      const endAt = Date.now();
      const startAt = endAt - RANGE_MS[range];

      const results = await batchedFetch(websiteIds, id =>
        get(`/websites/${id}/stats`, { startAt, endAt }).then(
          (stats: WebsiteStats) => [id, stats] as const,
          () => [id, null] as const,
        ),
      );

      return Object.fromEntries(
        results.filter(([, stats]) => stats !== null),
      );
    },
    enabled: enabled && websiteIds.length > 0,
    staleTime: bucketMs,
  });
}
