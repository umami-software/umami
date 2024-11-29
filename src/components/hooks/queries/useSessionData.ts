import { useApi } from '../useApi';

export function useSessionData(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session:data', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}/properties`, { websiteId });
    },
  });
}
