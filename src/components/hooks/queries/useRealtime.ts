import { RealtimeData } from 'lib/types';
import { useApi } from './useApi';
import { REALTIME_INTERVAL } from 'lib/constants';
import { useTimezone } from 'components/hooks';

export function useRealtime(websiteId: string) {
  const { get, useQuery } = useApi();
  const { timezone } = useTimezone();
  const { data, isLoading, error } = useQuery<RealtimeData>({
    queryKey: ['realtime', websiteId],
    queryFn: async () => {
      return get(`/realtime/${websiteId}`, { timezone });
    },
    enabled: !!websiteId,
    refetchInterval: REALTIME_INTERVAL,
  });

  return { data, isLoading, error };
}

export default useRealtime;
