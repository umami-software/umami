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
      }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } });
    },
    enabled: Boolean(websiteId && sessionId && startDate && endDate),
  });
}
