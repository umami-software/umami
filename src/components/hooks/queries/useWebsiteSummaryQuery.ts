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

  const endAt = Date.now();
  const startAt = endAt - ONE_DAY_MS;

  return useQuery<WebsiteSummaryData>({
    queryKey: ['websites:summary', { websiteId, startAt, endAt }],
    queryFn: async () => {
      const [stats, pageviewsData] = await Promise.all([
        get(`/websites/${websiteId}/stats`, { startAt, endAt }),
        get(`/websites/${websiteId}/pageviews`, {
          startAt,
          endAt,
          unit: 'hour',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      ]);
      return { stats, pageviews: pageviewsData?.sessions ?? [] };
    },
    enabled: !!websiteId,
    staleTime: 5 * 60 * 1000,
  });
}
