import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { usePagedQuery } from '../usePagedQuery';

export function useOutboundLinksQuery(
  websiteId: string,
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: [
      'websites:outbound-links',
      { websiteId, startAt, endAt, unit, timezone, ...filters, ...params },
    ],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/outbound-links`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
