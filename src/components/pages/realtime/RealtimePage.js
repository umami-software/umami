import { useState, useEffect, useMemo } from 'react';
import { subMinutes, startOfMinute } from 'date-fns';
import firstBy from 'thenby';
import { GridRow, GridColumn } from 'components/layout/Grid';
import Page from 'components/layout/Page';
import RealtimeChart from 'components/metrics/RealtimeChart';
import WorldMap from 'components/common/WorldMap';
import RealtimeLog from 'components/pages/realtime/RealtimeLog';
import RealtimeHeader from 'components/pages/realtime/RealtimeHeader';
import RealtimeUrls from 'components/pages/realtime/RealtimeUrls';
import RealtimeCountries from 'components/pages/realtime/RealtimeCountries';
import WebsiteHeader from 'components/pages/websites/WebsiteHeader';
import useApi from 'components/hooks/useApi';
import { percentFilter } from 'lib/filters';
import { REALTIME_RANGE, REALTIME_INTERVAL } from 'lib/constants';
import styles from './RealtimePage.module.css';
import { useWebsite } from 'components/hooks';

function mergeData(state = [], data = [], time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ timestamp }) => timestamp >= time);
}

export function RealtimePage({ websiteId }) {
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

  return (
    <Page loading={isLoading} error={error}>
      <WebsiteHeader websiteId={websiteId} />
      <RealtimeHeader websiteId={websiteId} data={currentData} />
      <RealtimeChart className={styles.chart} data={realtimeData} unit="minute" />
      <GridRow>
        <GridColumn xs={12} sm={12} md={12} lg={4} xl={4}>
          <RealtimeUrls websiteId={websiteId} websiteDomain={website?.domain} data={realtimeData} />
        </GridColumn>
        <GridColumn xs={12} sm={12} md={12} lg={8} xl={8}>
          <RealtimeLog websiteId={websiteId} websiteDomain={website?.domain} data={realtimeData} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn xs={12} lg={4}>
          <RealtimeCountries data={realtimeData?.countries} />
        </GridColumn>
        <GridColumn xs={12} lg={8}>
          <WorldMap data={realtimeData?.countries} />
        </GridColumn>
      </GridRow>
    </Page>
  );
}

export default RealtimePage;
