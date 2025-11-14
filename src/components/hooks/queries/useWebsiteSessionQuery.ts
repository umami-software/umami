import { useApi } from '../useApi';

export function useWebsiteSessionQuery(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}`);
    },
    enabled: Boolean(websiteId && sessionId),
  });
}
