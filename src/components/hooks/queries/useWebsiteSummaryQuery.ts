import { useApi } from '../useApi';

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

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useWebsiteSummaryQuery(websiteId: string) {
  const { get, useQuery } = useApi();

  // Stable 1-hour bucket so queries share cache across cards
  const bucket = Math.floor(Date.now() / (60 * 60 * 1000));

  return useQuery<WebsiteSummaryData>({
    queryKey: ['websites:summary', { websiteId, bucket }],
    queryFn: async () => {
      const endAt = Date.now();
      const startAt = endAt - ONE_DAY_MS;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const [stats, pageviewsData] = await Promise.all([
        get(`/websites/${websiteId}/stats`, { startAt, endAt }),
        get(`/websites/${websiteId}/pageviews`, {
          startAt,
          endAt,
          unit: 'hour',
          timezone,
        }),
      ]);
      return { stats, pageviews: pageviewsData?.sessions ?? [] };
    },
    enabled: !!websiteId,
    staleTime: 60 * 60 * 1000,
  });
}
