import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { subMinutes, startOfMinute } from 'date-fns';
import Page from 'components/layout/Page';
import useFetch from 'hooks/useFetch';
import RealtimeChart from '../metrics/RealtimeChart';
import RealtimeLog from '../metrics/RealtimeLog';
import styles from './RealtimeDashboard.module.css';
import RealtimeHeader from '../metrics/RealtimeHeader';

const REALTIME_RANGE = 30;
const REALTIME_INTERVAL = 5000;

function mergeData(state, data, time) {
  const ids = state.map(({ __id }) => __id);
  return state
    .concat(data.filter(({ __id }) => !ids.includes(__id)))
    .filter(({ created_at }) => new Date(created_at).getTime() >= time);
}

function filterWebsite(data, id) {
  return data.filter(({ website_id }) => website_id === id);
}

export default function RealtimeDashboard() {
  const [data, setData] = useState();
  const [websiteId, setWebsiteId] = useState(0);
  const { data: init, loading } = useFetch('/api/realtime', { params: { type: 'init' } });
  const { data: updates } = useFetch('/api/realtime', {
    params: { type: 'update', start_at: data?.timestamp },
    disabled: !init?.websites?.length || !data,
    interval: REALTIME_INTERVAL,
    headers: { 'x-umami-token': init?.token },
  });

  const realtimeData = useMemo(() => {
    if (websiteId) {
      const { pageviews, sessions, events, ...props } = data;
      return {
        pageviews: filterWebsite(pageviews, websiteId),
        sessions: filterWebsite(sessions, websiteId),
        events: filterWebsite(events, websiteId),
        ...props,
      };
    }
    return data;
  }, [data, websiteId]);

  useEffect(() => {
    if (init && !data) {
      setData(init.data);
    } else if (updates) {
      const { pageviews, sessions, events, timestamp } = updates;
      const minTime = subMinutes(startOfMinute(new Date()), REALTIME_RANGE).getTime();
      setData(state => ({
        pageviews: mergeData(state.pageviews, pageviews, minTime),
        sessions: mergeData(state.sessions, sessions, minTime),
        events: mergeData(state.events, events, minTime),
        timestamp,
      }));
    }
  }, [init, updates]);

  if (!init || loading || !data) {
    return null;
  }

  const { websites } = init;

  return (
    <Page>
      <RealtimeHeader
        websites={websites}
        websiteId={websiteId}
        data={realtimeData}
        onSelect={setWebsiteId}
      />
      <div className={styles.chart}>
        <RealtimeChart
          websiteId={websiteId}
          data={realtimeData}
          unit="minute"
          records={REALTIME_RANGE}
        />
      </div>
      <div className={classNames(styles.tables, 'row')}>
        <div className="col-12 col-lg-8">
          <RealtimeLog data={realtimeData} websites={websites} />
        </div>
        <div className="col-12 col-lg-4">hi.</div>
      </div>
    </Page>
  );
}
