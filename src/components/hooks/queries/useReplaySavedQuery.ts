import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useReplaySavedQuery(websiteId: string, replayId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified('replays');

  return useQuery({
    queryKey: ['replay:saved', { websiteId, replayId, modified }],
    queryFn: () => {
      return get(`/websites/${websiteId}/replays/saved/${replayId}`);
    },
    enabled: Boolean(websiteId && replayId),
  });
}
