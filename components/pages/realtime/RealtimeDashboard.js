import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { subMinutes, startOfMinute, differenceInMinutes } from 'date-fns';
import firstBy from 'thenby';
import { GridRow, GridColumn } from 'components/layout/Grid';
import Page from 'components/layout/Page';
import RealtimeChart from 'components/metrics/RealtimeChart';
import RealtimeLog from 'components/pages/realtime/RealtimeLog';
import RealtimeHeader from 'components/pages/realtime/RealtimeHeader';
import StickyHeader from 'components/helpers/StickyHeader';
import PageHeader from 'components/layout/PageHeader';
import WorldMap from 'components/common/WorldMap';
import DataTable from 'components/metrics/DataTable';
import RealtimeUrls from 'components/pages/realtime/RealtimeUrls';
import useApi from 'hooks/useApi';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { percentFilter } from 'lib/filters';
import { labels } from 'components/messages';
import { REALTIME_RANGE, REALTIME_INTERVAL } from 'lib/constants';
import styles from './RealtimeDashboard.module.css';
import WebsiteSelect from '../../input/WebsiteSelect';
import { useRouter } from 'next/router';

function mergeData(state = [], data, time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ createdAt }) => new Date(createdAt).getTime() >= time);
}

export default function RealtimeDashboard({ websiteId }) {
  const { formatMessage } = useIntl();
  const { locale } = useLocale();
  const router = useRouter();
  const countryNames = useCountryNames(locale);
  const [currentData, setCurrentData] = useState();
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(
    ['realtime', websiteId],
    () => get(`/realtime/${websiteId}`, { startAt: currentData?.timestamp }),
    {
      enabled: !!websiteId,
      retryInterval: REALTIME_INTERVAL,
    },
  );

  const renderCountryName = useCallback(
    ({ x }) => <span className={locale}>{countryNames[x]}</span>,
    [countryNames],
  );

  useEffect(() => {
    if (data) {
      const { pageviews, sessions, events, timestamp } = data;
      const time = subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime();

      setCurrentData(state => ({
        ...state,
        pageviews: mergeData(state?.pageviews, pageviews, time),
        sessions: mergeData(state?.sessions, sessions, time),
        events: mergeData(state?.events, events, time),
        timestamp,
      }));
    }
  }, [data]);

  const realtimeData = useMemo(() => {
    if (!currentData) {
      return { pageviews: [], sessions: [], events: [], countries: [] };
    }

    currentData.countries = percentFilter(
      currentData.sessions
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

    return currentData;
  }, [currentData]);

  const handleSelect = id => {
    router.push(`/realtime/${id}`);
  };

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(labels.realtime)}>
        <WebsiteSelect websiteId={websiteId} onSelect={handleSelect} />
      </PageHeader>
      <StickyHeader stickyClassName={styles.sticky}>
        <RealtimeHeader websiteId={websiteId} data={currentData} />
      </StickyHeader>
      <div className={styles.chart}>
        <RealtimeChart data={realtimeData} unit="minute" records={REALTIME_RANGE} />
      </div>
      <GridRow>
        <GridColumn xs={12} sm={12} md={12} lg={4} xl={4}>
          <RealtimeUrls websiteId={websiteId} data={realtimeData} />
        </GridColumn>
        <GridColumn xs={12} sm={12} md={12} lg={8} xl={8}>
          <RealtimeLog websiteId={websiteId} data={realtimeData} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn xs={12} lg={4}>
          <DataTable
            title={formatMessage(labels.countries)}
            metric={formatMessage(labels.visitors)}
            data={realtimeData?.countries}
            renderLabel={renderCountryName}
          />
        </GridColumn>
        <GridColumn xs={12} lg={8}>
          <WorldMap data={realtimeData?.countries} />
        </GridColumn>
      </GridRow>
    </Page>
  );
}
