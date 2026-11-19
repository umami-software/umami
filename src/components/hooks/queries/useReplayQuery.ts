import { useApi } from '../useApi';

interface ReplayQueryOptions {
  until?: number;
  chunkIndex?: number;
  eventIndex?: number;
}

export function useReplayQuery(
  websiteId: string,
  replayId: string,
  options: ReplayQueryOptions = {},
) {
  const { get, useQuery } = useApi();
  const { until, chunkIndex, eventIndex } = options;

  return useQuery({
    queryKey: ['replay', { websiteId, replayId, until, chunkIndex, eventIndex }],
    queryFn: () => {
      return get(`/websites/${websiteId}/replays/${replayId}`, { until, chunkIndex, eventIndex });
    },
    enabled: Boolean(websiteId && replayId),
  });
}
