import React, { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { subMinutes, startOfMinute } from 'date-fns';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import DropDown from 'components/common/DropDown';
import useFetch from 'hooks/useFetch';
import RealtimeChart from '../metrics/RealtimeChart';
import RealtimeLog from '../metrics/RealtimeLog';

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
  const [website, setWebsite] = useState();
  const { data: init, loading } = useFetch('/api/realtime', { params: { type: 'init' } });
  const { data: updates } = useFetch('/api/realtime', {
    params: { type: 'update', start_at: data?.timestamp },
    disabled: !init?.token || !data,
    interval: REALTIME_INTERVAL,
    headers: { 'x-umami-token': init?.token },
  });

  const realtimeData = useMemo(() => {
    if (website) {
      const { website_id } = website;
      const { pageviews, sessions, events, ...props } = data;
      return {
        pageviews: filterWebsite(pageviews, website_id),
        sessions: filterWebsite(sessions, website_id),
        events: filterWebsite(events, website_id),
        ...props,
      };
    }
    return data;
  }, [data, website]);

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

  const options = [
    { label: <FormattedMessage id="label.all-websites" defaultMessage="All websites" />, value: 0 },
  ].concat(websites.map(({ name, website_id }) => ({ label: name, value: website_id })));
  const selectedValue = options.find(({ value }) => value === website?.website_id)?.value || 0;

  function handleSelect(value) {
    setWebsite(websites.find(({ website_id }) => website_id === value));
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <FormattedMessage id="label.realtime" defaultMessage="Realtime" />
        </div>
        <DropDown value={selectedValue} options={options} onChange={handleSelect} />
      </PageHeader>
      <RealtimeChart
        websiteId={website?.website_id}
        data={realtimeData}
        unit="minute"
        records={REALTIME_RANGE}
      />
      <div className="row">
        <div className="col-12">
          <RealtimeLog data={realtimeData} websites={websites} />
        </div>
      </div>
    </Page>
  );
}
