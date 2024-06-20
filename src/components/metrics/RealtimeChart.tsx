import { useMemo, useRef } from 'react';
import { startOfMinute, subMinutes, isBefore } from 'date-fns';
import PageviewsChart from './PageviewsChart';
import { getDateArray } from 'lib/date';
import { DEFAULT_ANIMATION_DURATION, REALTIME_RANGE } from 'lib/constants';
import { RealtimeData } from 'lib/types';

export interface RealtimeChartProps {
  data: RealtimeData;
  unit: string;
  className?: string;
}

export function RealtimeChart({ data, unit, ...props }: RealtimeChartProps) {
  const endDate = startOfMinute(new Date());
  const startDate = subMinutes(endDate, REALTIME_RANGE);
  const prevEndDate = useRef(endDate);

  const chartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    return {
      pageviews: getDateArray(data.series.views, startDate, endDate, unit),
      sessions: getDateArray(data.series.visitors, startDate, endDate, unit),
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
    <PageviewsChart {...props} unit={unit} data={chartData} animationDuration={animationDuration} />
  );
}

export default RealtimeChart;
