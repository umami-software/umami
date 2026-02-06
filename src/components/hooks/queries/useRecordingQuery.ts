import { useApi } from '../useApi';

export function useRecordingQuery(websiteId: string, sessionId: string) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['recording', { websiteId, sessionId }],
    queryFn: () => {
      return get(`/websites/${websiteId}/recordings/${sessionId}`);
    },
    enabled: Boolean(websiteId && sessionId),
  });
}
