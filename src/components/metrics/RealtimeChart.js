import { useMemo, useRef } from 'react';
import { format, startOfMinute, subMinutes, isBefore } from 'date-fns';
import PageviewsChart from './PageviewsChart';
import { getDateArray } from 'lib/date';
import { DEFAULT_ANIMATION_DURATION, REALTIME_RANGE } from 'lib/constants';

function mapData(data) {
  let last = 0;
  const arr = [];

  data?.reduce((obj, { timestamp }) => {
    const t = startOfMinute(new Date(timestamp));
    if (t.getTime() > last) {
      obj = { x: format(t, 'yyyy-LL-dd HH:mm:00'), y: 1 };
      arr.push(obj);
      last = t.getTime();
    } else {
      obj.y += 1;
    }
    return obj;
  }, {});

  return arr;
}

export function RealtimeChart({ data, unit, ...props }) {
  const endDate = startOfMinute(new Date());
  const startDate = subMinutes(endDate, REALTIME_RANGE);
  const prevEndDate = useRef(endDate);

  const chartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    return {
      pageviews: getDateArray(mapData(data.pageviews), startDate, endDate, unit),
      sessions: getDateArray(mapData(data.visitors), startDate, endDate, unit),
    };
  }, [data, startDate, endDate, unit]);

  // Don't animate the bars shifting over because it looks weird
  const animationDuration = useMemo(() => {
    if (isBefore(prevEndDate.current, endDate)) {
      prevEndDate.current = endDate;
      return 0;
    }
    return DEFAULT_ANIMATION_DURATION;
  }, [endDate]);

  return (
    <PageviewsChart
      {...props}
      height={200}
      unit={unit}
      data={chartData}
      animationDuration={animationDuration}
    />
  );
}

export default RealtimeChart;
