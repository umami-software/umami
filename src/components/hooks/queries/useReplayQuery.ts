import { useApi } from '../useApi';

export function useReplayQuery(websiteId: string, replayId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['replay', { websiteId, replayId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/replays/${replayId}`);
    },
    enabled: Boolean(websiteId && replayId),
  });
}
