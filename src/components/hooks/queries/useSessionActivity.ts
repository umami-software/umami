import { useApi } from '../useApi';

export function useSessionActivity(
  websiteId: string,
  sessionId: string,
  startDate: Date,
  endDate: Date,
) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session:activity', { websiteId, sessionId, startDate, endDate }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/activity`, {
        startAt: +new Date(startDate),
        endAt: +new Date(endDate),
      });
    },
    enabled: Boolean(websiteId && sessionId && startDate && endDate),
  });
}
