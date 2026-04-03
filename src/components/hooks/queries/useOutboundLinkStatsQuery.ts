import type { UseQueryOptions } from '@tanstack/react-query';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';

export interface OutboundLinkStatsData {
  clicks: number;
  visitors: number;
  visits: number;
  uniqueLinks: number;
  comparison: {
    clicks: number;
    visitors: number;
    visits: number;
    uniqueLinks: number;
  };
}

type OutboundLinkStatsApiResponse = {
  data: OutboundLinkStatsData;
};

export function useOutboundLinkStatsQuery(
  { websiteId }: { websiteId: string },
  options?: UseQueryOptions<OutboundLinkStatsApiResponse, Error, OutboundLinkStatsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<OutboundLinkStatsApiResponse, Error, OutboundLinkStatsData>({
    queryKey: ['websites:outbound-links:stats', { websiteId, startAt, endAt, ...filters }],
    queryFn: () =>
      get(`/websites/${websiteId}/outbound-links/stats`, {
        startAt,
        endAt,
        ...filters,
      }),
    select: response => response.data,
    enabled: !!websiteId,
    ...options,
  });
}
