import { useMemo } from 'react';
import { Loading } from 'react-basics';
import { colord } from 'colord';
import BarChart from 'components/charts/BarChart';
import { getDateArray } from 'lib/date';
import { useLocale, useDateRange, useWebsiteEvents } from 'components/hooks';
import { CHART_COLORS } from 'lib/constants';
import { renderDateLabels } from 'lib/charts';

export interface EventsChartProps {
  websiteId: string;
  className?: string;
}

export function EventsChart({ websiteId, className }: EventsChartProps) {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange(websiteId);
  const { locale } = useLocale();
  const { data, isLoading } = useWebsiteEvents(websiteId);

  const chartData = useMemo(() => {
    if (!data) return [];

    const map = (data as any[]).reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ x: t, y });

      return obj;
    }, {});

    Object.keys(map).forEach(key => {
      map[key] = getDateArray(map[key], startDate, endDate, unit);
    });

    return {
      datasets: Object.keys(map).map((key, index) => {
        const color = colord(CHART_COLORS[index % CHART_COLORS.length]);
        return {
          label: key,
          data: map[key],
          lineTension: 0,
          backgroundColor: color.alpha(0.6).toRgbString(),
          borderColor: color.alpha(0.7).toRgbString(),
          borderWidth: 1,
        };
      }),
    };
  }, [data, startDate, endDate, unit]);

  if (isLoading) {
    return <Loading icon="dots" />;
  }

  return (
    <BarChart
      className={className}
      data={chartData}
      unit={unit}
      stacked={true}
      renderXLabel={renderDateLabels(unit, locale)}
      isLoading={isLoading}
    />
  );
}

export default EventsChart;
