import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useReplaysQuery(websiteId: string, params?: Record<string, string | number>) {
  const { get } = useApi();
  const { modified } = useModified('replays');
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: [
      'replays',
      { websiteId, modified, startAt, endAt, unit, timezone, ...filters, ...params },
    ],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/replays`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
        ...params,
        pageSize: 20,
      });
    },
  });
}
