import { useTimezone } from '@/components/hooks/useTimezone';
import { REALTIME_INTERVAL } from '@/lib/constants';
import { useApi } from '../useApi';

export interface RealtimeData {
  countries: Record<string, number>;
  events: any[];
  pageviews: any[];
  referrers: Record<string, number>;
  timestamp: number;
  series: {
    views: any[];
    visitors: any[];
  };
  totals: {
    views: number;
    visitors: number;
    events: number;
    countries: number;
  };
  urls: Record<string, number>;
  visitors: any[];
}

export function useRealtimeQuery(websiteId: string) {
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
