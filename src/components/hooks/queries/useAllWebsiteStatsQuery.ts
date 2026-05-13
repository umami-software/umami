import { useApi } from '../useApi';
import { getRangeBucketMs, type OverviewRange, RANGE_MS } from './useWebsiteSummaryQuery';

export type SortField = 'name' | 'visitors' | 'pageviews';

export interface WebsiteStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

interface AllWebsiteStatsResult {
  stats: Record<string, WebsiteStats>;
  failedIds: string[];
}

export function useAllWebsiteStatsQuery(
  websiteIds: string[],
  range: OverviewRange,
  enabled = true,
) {
  const { get, useQuery } = useApi();

  const bucketMs = getRangeBucketMs(range);
  const bucket = Math.floor(Date.now() / bucketMs);

  return useQuery<AllWebsiteStatsResult>({
    queryKey: ['websites:all-stats', { ids: websiteIds, range, bucket }],
    queryFn: async () => {
      const endAt = Date.now();
      const startAt = endAt - RANGE_MS[range];

      try {
        const stats = await get('/websites/stats', {
          ids: websiteIds.join(','),
          startAt,
          endAt,
        });
        return { stats: stats as Record<string, WebsiteStats>, failedIds: [] };
      } catch {
        return { stats: {}, failedIds: websiteIds };
      }
    },
    enabled: enabled && websiteIds.length > 0,
    staleTime: bucketMs,
  });
}
