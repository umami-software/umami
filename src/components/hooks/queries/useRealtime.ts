import { useMemo, useRef } from 'react';
import { RealtimeData } from 'lib/types';
import { useApi } from 'components/hooks';
import { REALTIME_INTERVAL, REALTIME_RANGE } from 'lib/constants';
import { startOfMinute, subMinutes } from 'date-fns';
import { percentFilter } from 'lib/filters';
import thenby from 'thenby';

function mergeData(state = [], data = [], time: number) {
  const ids = state.map(({ id }) => id);
  return state
    .concat(data.filter(({ id }) => !ids.includes(id)))
    .filter(({ timestamp }) => timestamp >= time);
}

export function useRealtime(websiteId: string) {
  const currentData = useRef({
    pageviews: [],
    sessions: [],
    events: [],
    countries: [],
    visitors: [],
    timestamp: 0,
  });
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery<RealtimeData>({
    queryKey: ['realtime', websiteId],
    queryFn: async () => {
      const state = currentData.current;
      const data = await get(`/realtime/${websiteId}`, { startAt: state?.timestamp || 0 });
      const date = subMinutes(startOfMinute(new Date()), REALTIME_RANGE);
      const time = date.getTime();
      const { pageviews, sessions, events, timestamp } = data;

      return {
        pageviews: mergeData(state?.pageviews, pageviews, time),
        sessions: mergeData(state?.sessions, sessions, time),
        events: mergeData(state?.events, events, time),
        timestamp,
      };
    },
    enabled: !!websiteId,
    refetchInterval: REALTIME_INTERVAL,
  });

  const realtimeData: RealtimeData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [], events: [], countries: [], visitors: [], timestamp: 0 };
    }

    data.countries = percentFilter(
      data.sessions
        .reduce((arr, data) => {
          if (!arr.find(({ id }) => id === data.id)) {
            return arr.concat(data);
          }
          return arr;
        }, [])
        .reduce((arr: { x: any; y: number }[], { country }: any) => {
          if (country) {
            const row = arr.find(({ x }) => x === country);

            if (!row) {
              arr.push({ x: country, y: 1 });
            } else {
              row.y += 1;
            }
          }
          return arr;
        }, [])
        .sort(thenby.firstBy('y', -1)),
    );

    data.visitors = data.sessions.reduce((arr, val) => {
      if (!arr.find(({ id }) => id === val.id)) {
        return arr.concat(val);
      }
      return arr;
    }, []);

    return data;
  }, [data]);

  return { data: realtimeData, isLoading, error };
}

export default useRealtime;
