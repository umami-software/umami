import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useRecordingsQuery(websiteId: string, params?: Record<string, string | number>) {
  const { get } = useApi();
  const { modified } = useModified('recordings');
  const { startAt, endAt, unit, timezone } = useDateParameters();

  return usePagedQuery({
    queryKey: ['recordings', { websiteId, modified, startAt, endAt, unit, timezone, ...params }],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/recordings`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...pageParams,
        ...params,
        pageSize: 20,
      });
    },
  });
}
