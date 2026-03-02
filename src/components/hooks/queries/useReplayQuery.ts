import { useApi } from '../useApi';

export function useReplayQuery(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['replay', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/replays/${sessionId}`);
    },
    enabled: Boolean(websiteId && sessionId),
  });
}
