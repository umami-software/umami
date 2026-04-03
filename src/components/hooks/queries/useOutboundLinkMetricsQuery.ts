import type { UseQueryOptions } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';

export interface OutboundLinkMetric {
  url?: string;
  domain?: string;
  clicks: number;
  visitors: number;
}

export function useOutboundLinkMetricsQuery(
  websiteId: string,
  params: { type: string; limit?: number },
  options?: UseQueryOptions<OutboundLinkMetric[], Error>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<OutboundLinkMetric[], Error>({
    queryKey: [
      'websites:outbound-links:metrics',
      { websiteId, startAt, endAt, ...filters, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/outbound-links/metrics`, {
        startAt,
        endAt,
        ...filters,
        ...params,
      }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
