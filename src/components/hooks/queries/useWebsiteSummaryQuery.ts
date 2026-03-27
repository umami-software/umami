import { useApi } from '../useApi';

export type OverviewRange = '24h' | '7d' | '30d' | '1y';

export interface WebsiteSummaryData {
  stats: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
  pageviews: { x: string; y: number }[];
}

const MS: Record<OverviewRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
};

const UNIT: Record<OverviewRange, string> = {
  '24h': 'hour',
  '7d': 'day',
  '30d': 'day',
  '1y': 'month',
};

export function useWebsiteSummaryQuery(websiteId: string, range: OverviewRange = '24h') {
  const { get, useQuery } = useApi();

  // Stable bucket: 1h for 24h range, 6h for longer ranges
  const bucketMs = range === '24h' ? 60 * 60 * 1000 : 6 * 60 * 60 * 1000;
  const bucket = Math.floor(Date.now() / bucketMs);

  return useQuery<WebsiteSummaryData>({
    queryKey: ['websites:summary', { websiteId, range, bucket }],
    queryFn: async () => {
      const endAt = Date.now();
      const startAt = endAt - MS[range];
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const [stats, pageviewsData] = await Promise.all([
        get(`/websites/${websiteId}/stats`, { startAt, endAt }),
        get(`/websites/${websiteId}/pageviews`, {
          startAt,
          endAt,
          unit: UNIT[range],
          timezone,
        }),
      ]);
      return { stats, pageviews: pageviewsData?.sessions ?? [] };
    },
    enabled: !!websiteId,
    staleTime: bucketMs,
  });
}
