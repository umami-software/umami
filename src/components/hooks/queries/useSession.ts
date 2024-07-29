import { useApi } from './useApi';

export function useSession(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['session', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/${sessionId}`);
    },
  });
}

export default useSession;
