import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export type PropertyDataSource = 'event' | 'session';

export function usePropertyFieldsQuery(
  source: PropertyDataSource,
  websiteId: string,
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery<any>({
    queryKey: [
      `websites:${source}-data:fields`,
      { websiteId, eventName, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(
        source === 'event'
          ? `/websites/${websiteId}/event-data/fields`
          : `/websites/${websiteId}/session-data/properties`,
        {
          ...(source === 'event' ? { event: eventName } : {}),
          startAt,
          endAt,
          unit,
          timezone,
          ...params,
        },
      ),
    enabled: !!(websiteId && (source === 'session' || eventName)),
    ...options,
  });
}
