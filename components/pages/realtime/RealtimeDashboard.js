import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { subMinutes, startOfMinute, differenceInMinutes } from 'date-fns';
import firstBy from 'thenby';
import { GridRow, GridColumn } from 'components/layout/Grid';
import Page from 'components/layout/Page';
import RealtimeChart from 'components/metrics/RealtimeChart';
import RealtimeLog from 'components/pages/realtime/RealtimeLog';
import RealtimeHeader from 'components/pages/realtime/RealtimeHeader';
import WorldMap from 'components/common/WorldMap';
import DataTable from 'components/metrics/DataTable';
import RealtimeViews from 'components/pages/realtime/RealtimeViews';
import useApi from 'hooks/useApi';
import useLocale from 'hooks/useLocale';
import useCountryNames from 'hooks/useCountryNames';
import { percentFilter } from 'lib/filters';
import { labels } from 'components/messages';
import { SHARE_TOKEN_HEADER, REALTIME_RANGE, REALTIME_INTERVAL } from 'lib/constants';
import styles from './RealtimeDashboard.module.css';
import StickyHeader from 'components/helpers/StickyHeader';
import PageHeader from 'components/layout/PageHeader';
import ActiveUsers from 'components/metrics/ActiveUsers';

function mergeData(state, data, time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ createdAt }) => new Date(createdAt).getTime() >= time);
}

function filterWebsite(data, id) {
  return data.filter(({ websiteId }) => websiteId === id);
}

export default function RealtimeDashboard() {
  const { formatMessage } = useIntl();
  const { locale } = useLocale();
  const countryNames = useCountryNames(locale);
  const [data, setData] = useState();
  const [websiteId, setWebsiteId] = useState();
  const { get, useQuery } = useApi();
  const { data: websites, isLoading } = useQuery(['websites:me'], () => get('/me/websites'));

  const { data: updates } = useQuery(
    ['realtime:updates'],
    () => get('/realtime/update', { startAt: data?.timestamp }),
    {
      enabled: !!websiteId,
      retryInterval: REALTIME_INTERVAL,
    },
  );

  const renderCountryName = useCallback(
    ({ x }) => <span className={locale}>{countryNames[x]}</span>,
    [countryNames],
  );

  const realtimeData = useMemo(() => {
    if (data) {
      const { pageviews, sessions, events } = data;

      if (websiteId) {
        const { id } = websites.find(n => n.id === websiteId);
        return {
          pageviews: filterWebsite(pageviews, id),
          sessions: filterWebsite(sessions, id),
          events: filterWebsite(events, id),
        };
      }
    }

    return data;
  }, [data, websiteId]);

  const count = useMemo(() => {
    if (data) {
      const { sessions } = data;
      return sessions.filter(
        ({ createdAt }) => differenceInMinutes(new Date(), new Date(createdAt)) <= 5,
      ).length;
    }
  }, [data, websiteId]);

  const countries = useMemo(() => {
    if (realtimeData?.sessions) {
      return percentFilter(
        realtimeData.sessions
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
    }
    return [];
  }, [realtimeData?.sessions]);

  useEffect(() => {
    if (updates) {
      const { pageviews, sessions, events, timestamp } = updates;
      const time = subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime();

      setData(state => ({
        ...state,
        pageviews: mergeData(state.pageviews, pageviews, time),
        sessions: mergeData(state.sessions, sessions, time),
        events: mergeData(state.events, events, time),
        timestamp,
      }));
    }
  }, [updates]);

  return (
    <Page loading={isLoading || !websites}>
      <PageHeader title={formatMessage(labels.realtime)}>
        <ActiveUsers value={count} />
      </PageHeader>
      <StickyHeader stickyClassName={styles.sticky}>
        <RealtimeHeader
          websites={websites}
          websiteId={websiteId}
          data={{ ...realtimeData, countries }}
          onSelect={setWebsiteId}
        />
      </StickyHeader>
      <div className={styles.chart}>
        <RealtimeChart data={realtimeData} unit="minute" records={REALTIME_RANGE} />
      </div>
      <GridRow>
        <GridColumn xs={12} sm={12} md={12} lg={4} xl={4}>
          <RealtimeViews websiteId={websiteId} data={realtimeData} websites={websites} />
        </GridColumn>
        <GridColumn xs={12} sm={12} md={12} lg={8} xl={8}>
          <RealtimeLog websiteId={websiteId} data={realtimeData} websites={websites} />
        </GridColumn>
      </GridRow>
      <GridRow>
        <GridColumn xs={12} lg={4}>
          <DataTable
            title={formatMessage(labels.countries)}
            metric={formatMessage(labels.visitors)}
            data={countries}
            renderLabel={renderCountryName}
          />
        </GridColumn>
        <GridColumn xs={12} lg={8}>
          <WorldMap data={countries} />
        </GridColumn>
      </GridRow>
    </Page>
  );
}
