import React, { useMemo } from 'react';
import { format, parseISO, startOfMinute, subMinutes } from 'date-fns';
import PageviewsChart from './PageviewsChart';
import { getDateArray } from 'lib/date';

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

export default function RealtimeChart({ data, ...props }) {
  const chartData = useMemo(() => {
    if (data) {
      const endDate = startOfMinute(new Date());
      const startDate = subMinutes(endDate, 30);
      const unit = 'minute';

      return {
        pageviews: getDateArray(mapData(data.pageviews), startDate, endDate, unit),
        sessions: getDateArray(mapData(data.sessions), startDate, endDate, unit),
      };
    }
    return { pageviews: [], sessions: [] };
  }, [data]);

  return <PageviewsChart {...props} data={chartData} />;
}
