import { REALTIME_INTERVAL } from '@/lib/constants';
import type { RealtimeData } from '@/lib/types';
import { useApi } from '../useApi';

export function useRealtimeQuery(websiteId: string) {
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery<RealtimeData>({
    queryKey: ['realtime', { websiteId }],
    queryFn: async () => {
      return get(`/realtime/${websiteId}`);
    },
    enabled: !!websiteId,
    refetchInterval: REALTIME_INTERVAL,
  });

  return { data, isLoading, error };
}
