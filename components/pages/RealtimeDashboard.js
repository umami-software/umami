import React, { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { subMinutes, startOfMinute, parseISO, format } from 'date-fns';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import DropDown from 'components/common/DropDown';
import useFetch from 'hooks/useFetch';
import PageviewsChart from '../metrics/PageviewsChart';
import { getDateArray } from '../../lib/date';

function filterTime(data, time) {
  return data.filter(({ created_at }) => new Date(created_at).getTime() > time);
}

function mapData(data) {
  let last = 0;
  const arr = [];

  data.reduce((obj, val) => {
    const { created_at } = val;
    const t = startOfMinute(parseISO(created_at));
    if (t.getTime() > last) {
      obj = { t: format(t, 'yyyy-LL-dd HH:mm:00'), y: 1 };
      arr.push(obj);
      last = t;
    } else {
      obj.y += 1;
    }
    return obj;
  }, {});

  return arr;
}

export default function RealtimeDashboard() {
  const [data, setData] = useState();
  const [website, setWebsite] = useState();
  const { data: init, loading } = useFetch('/api/realtime', { type: 'init' });
  const { data: updates } = useFetch(
    '/api/realtime',
    { type: 'update' },
    { disabled: !init?.token, interval: 5000, headers: { 'x-umami-token': init?.token } },
  );

  const chartData = useMemo(() => {
    if (data) {
      const endDate = startOfMinute(new Date());
      const startDate = subMinutes(endDate, 30);
      const unit = 'minute';

      console.log({ data });

      return {
        pageviews: getDateArray(mapData(data.pageviews), startDate, endDate, unit),
        sessions: getDateArray(mapData(data.sessions), startDate, endDate, unit),
      };
    }
    return { pageviews: [], sessions: [] };
  }, [data]);

  useEffect(() => {
    if (init && !data) {
      setData(init.data);
    } else if (updates) {
      const { pageviews, sessions, events } = updates;
      const time = subMinutes(startOfMinute(new Date()), 30).getTime();
      setData(state => ({
        pageviews: filterTime(state.pageviews, time).concat(pageviews),
        sessions: filterTime(state.sessions, time).concat(sessions),
        events: filterTime(state.events, time).concat(events),
      }));
    }
  }, [updates, init]);

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
      <PageviewsChart websiteId={website?.website_id} data={chartData} unit="minute" records={30} />
    </Page>
  );
}
