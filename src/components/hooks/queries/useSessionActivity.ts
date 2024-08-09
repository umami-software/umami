import { useApi } from './useApi';

export function useSessionActivity(
  websiteId: string,
  sessionId: string,
  startDate: string,
  endDate: string,
) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session:activity', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/activity`, { startDate, endDate });
    },
  });
}
