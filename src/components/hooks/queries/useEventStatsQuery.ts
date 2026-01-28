import type { UseQueryOptions } from '@tanstack/react-query';
import { useDateParameters } from '@/components/hooks/useDateParameters';
import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';

export interface EventStatsData {
  events: number;
  visitors: number;
  visits: number;
  uniqueEvents: number;
}

type EventStatsApiResponse = {
  data: EventStatsData;
};

export function useEventStatsQuery(
  { websiteId }: { websiteId: string },
  options?: UseQueryOptions<EventStatsApiResponse, Error, EventStatsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<EventStatsApiResponse, Error, EventStatsData>({
    queryKey: ['websites:events:stats', { websiteId, startAt, endAt, ...filters }],
    queryFn: () =>
      get(`/websites/${websiteId}/events/stats`, {
        startAt,
        endAt,
        ...filters,
      }),
    select: response => response.data,
    enabled: !!websiteId,
    ...options,
  });
}
