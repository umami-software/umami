import { useApi } from '../useApi';

export function useSessionActivityQuery(
  websiteId: string,
  sessionId: string,
  startDate: Date,
  endDate: Date,
  distinctId?: string,
) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session:activity', { websiteId, sessionId, startDate, endDate, distinctId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/activity`, {
        startAt: +new Date(startDate),
        endAt: +new Date(endDate),
        ...(distinctId && { distinctId }),
      });
    },
    enabled: Boolean(websiteId && sessionId && startDate && endDate),
  });
}
