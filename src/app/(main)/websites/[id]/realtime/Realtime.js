'use client';
import { useMemo, useState, useEffect } from 'react';
import { subMinutes, startOfMinute } from 'date-fns';
import firstBy from 'thenby';
import { Grid, GridRow } from 'components/layout/Grid';
import Page from 'components/layout/Page';
import RealtimeChart from 'components/metrics/RealtimeChart';
import WorldMap from 'components/common/WorldMap';
import RealtimeLog from './RealtimeLog';
import RealtimeHeader from './RealtimeHeader';
import RealtimeUrls from './RealtimeUrls';
import RealtimeCountries from './RealtimeCountries';
import WebsiteHeader from '../WebsiteHeader';
import useApi from 'components/hooks/useApi';
import { percentFilter } from 'lib/filters';
import { REALTIME_RANGE, REALTIME_INTERVAL } from 'lib/constants';
import { useWebsite } from 'components/hooks';
import styles from './Realtime.module.css';

function mergeData(state = [], data = [], time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ timestamp }) => timestamp >= time);
}

export function Realtime({ websiteId }) {
  const [currentData, setCurrentData] = useState();
  const { get, useQuery } = useApi();
  const { data: website } = useWebsite(websiteId);
  const { data, isLoading, error } = useQuery(
    ['realtime', websiteId],
    () => get(`/realtime/${websiteId}`, { startAt: currentData?.timestamp || 0 }),
    {
      enabled: !!(websiteId && website),
      refetchInterval: REALTIME_INTERVAL,
      cache: false,
    },
  );

  useEffect(() => {
    if (data) {
      const date = subMinutes(startOfMinute(new Date()), REALTIME_RANGE);
      const time = date.getTime();

      setCurrentData(state => ({
        pageviews: mergeData(state?.pageviews, data.pageviews, time),
        sessions: mergeData(state?.sessions, data.sessions, time),
        events: mergeData(state?.events, data.events, time),
        timestamp: data.timestamp,
      }));
    }
  }, [data]);

  const realtimeData = useMemo(() => {
    if (!currentData) {
      return { pageviews: [], sessions: [], events: [], countries: [], visitors: [] };
    }

    currentData.countries = percentFilter(
      currentData.sessions
        .reduce((arr, data) => {
          if (!arr.find(({ id }) => id === data.id)) {
            return arr.concat(data);
          }
          return arr;
        }, [])
        .reduce((arr, { country }) => {
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
        .sort(firstBy('y', -1)),
    );

    currentData.visitors = currentData.sessions.reduce((arr, val) => {
      if (!arr.find(({ id }) => id === val.id)) {
        return arr.concat(val);
      }
      return arr;
    }, []);

    return currentData;
  }, [currentData]);

  if (isLoading || error) {
    return <Page loading={isLoading} error={error} />;
  }

  return (
    <>
      <WebsiteHeader websiteId={websiteId} />
      <RealtimeHeader websiteId={websiteId} data={currentData} />
      <RealtimeChart className={styles.chart} data={realtimeData} unit="minute" />
      <Grid>
        <GridRow columns="one-two">
          <RealtimeUrls websiteId={websiteId} websiteDomain={website?.domain} data={realtimeData} />
          <RealtimeLog websiteId={websiteId} websiteDomain={website?.domain} data={realtimeData} />
        </GridRow>
        <GridRow columns="one-two">
          <RealtimeCountries data={realtimeData?.countries} />
          <WorldMap data={realtimeData?.countries} />
        </GridRow>
      </Grid>
    </>
  );
}

export default Realtime;
