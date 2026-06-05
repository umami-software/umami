import { MAX_PAGING_RESULTS } from '@/lib/constants';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useRevenueSessionsQuery(
  websiteId: string,
  currency: string,
  params?: Record<string, string | number>,
) {
  const { get } = useApi();
  const { modified } = useModified(`revenue-sessions`);
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: [
      'revenue-sessions',
      { websiteId, currency, modified, startAt, endAt, unit, timezone, ...params, ...filters },
    ],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/revenue/sessions`, {
        currency,
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
        ...params,
        maxResults: MAX_PAGING_RESULTS,
      });
    },
  });
}
