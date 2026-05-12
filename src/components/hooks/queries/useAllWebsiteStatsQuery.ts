import { useApi } from '../useApi';

export type SortField = 'name' | 'visitors' | 'pageviews';

interface WebsiteStats {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

const MS: Record<string, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
};

export function useAllWebsiteStatsQuery(
  websiteIds: string[],
  range: string,
  enabled = true,
) {
  const { get, useQuery } = useApi();

  const bucketMs = range === '24h' ? 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
  const bucket = Math.floor(Date.now() / bucketMs);

  return useQuery<Record<string, WebsiteStats>>({
    queryKey: ['websites:all-stats', { ids: websiteIds, range, bucket }],
    queryFn: async () => {
      const endAt = Date.now();
      const startAt = endAt - MS[range];

      const results = await Promise.all(
        websiteIds.map(id =>
          get(`/websites/${id}/stats`, { startAt, endAt }).then(
            (stats: WebsiteStats) => [id, stats] as const,
            () => [id, null] as const,
          ),
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
