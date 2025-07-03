import { useApi } from '../useApi';

export function useSessionData(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session:data', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/properties`, { websiteId }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } });
    },
  });
}
