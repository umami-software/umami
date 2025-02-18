import { useTimezone } from '@/components/hooks/useTimezone';
import { REALTIME_INTERVAL } from '@/lib/constants';
import { RealtimeData } from '@/lib/types';
import { useApi } from '../useApi';

export function useRealtime(websiteId: string) {
  const { get, useQuery } = useApi();
  const { timezone } = useTimezone();
  const { data, isLoading, error } = useQuery<RealtimeData>({
    queryKey: ['realtime', { websiteId, timezone }],
    queryFn: async () => {
      return get(`/realtime/${websiteId}`, { timezone });
    },
    enabled: !!websiteId,
    refetchInterval: REALTIME_INTERVAL,
  });

  return { data, isLoading, error };
}

export default useRealtime;
