import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { usePagedQuery } from '../usePagedQuery';

export function useSessionReplaysQuery(websiteId: string, sessionId: string) {
  const { get } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();

  return usePagedQuery({
    queryKey: ['session-replays', { websiteId, sessionId, startAt, endAt, unit, timezone }],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/replays`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...pageParams,
      });
    },
  });
}
