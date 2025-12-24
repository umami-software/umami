import { isBefore, startOfMinute, subMinutes } from 'date-fns';
import { useMemo, useRef } from 'react';
import { useTimezone } from '@/components/hooks';
import { DEFAULT_ANIMATION_DURATION, REALTIME_RANGE } from '@/lib/constants';
import type { RealtimeData } from '@/lib/types';
import { PageviewsChart } from './PageviewsChart';

export interface RealtimeChartProps {
  data: RealtimeData;
  unit: string;
  className?: string;
}

export function RealtimeChart({ data, unit, ...props }: RealtimeChartProps) {
  const { formatSeriesTimezone, fromUtc, timezone } = useTimezone();
  const endDate = startOfMinute(new Date());
  const startDate = subMinutes(endDate, REALTIME_RANGE);
  const prevEndDate = useRef(endDate);
  const prevData = useRef<string | null>(null);

  const chartData = useMemo(() => {
    if (!data) {
      return { pageviews: [], sessions: [] };
    }

    return {
      pageviews: formatSeriesTimezone(data.series.views, 'x', timezone),
      sessions: formatSeriesTimezone(data.series.visitors, 'x', timezone),
    };
  }, [data, startDate, endDate, unit]);

  const animationDuration = useMemo(() => {
    // Don't animate the bars shifting over because it looks weird
    if (isBefore(prevEndDate.current, endDate)) {
      prevEndDate.current = endDate;
      return 0;
    }

    // Don't animate when data hasn't changed
    const serialized = JSON.stringify(chartData);
    if (prevData.current === serialized) {
      return 0;
    }
    prevData.current = serialized;

    return DEFAULT_ANIMATION_DURATION;
  }, [endDate, chartData]);

  return (
    <PageviewsChart
      {...props}
      minDate={fromUtc(startDate)}
      maxDate={fromUtc(endDate)}
      unit={unit}
      data={chartData}
      animationDuration={animationDuration}
    />
  );
}
