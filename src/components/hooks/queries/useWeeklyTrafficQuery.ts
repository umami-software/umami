import { useFilterParameters } from '@/components/hooks/useFilterParameters';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useModified } from '../useModified';

export function useWeeklyTrafficQuery(websiteId: string, params?: Record<string, string | number>) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`sessions`);
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery({
    queryKey: [
      'sessions',
      { websiteId, modified, startAt, endAt, unit, timezone, ...params, ...filters },
    ],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/weekly`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
        ...filters,
      });
    },
  });
}
