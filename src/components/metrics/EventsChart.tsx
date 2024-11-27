import { colord } from 'colord';
import BarChart from 'components/charts/BarChart';
import { useDateRange, useLocale, useWebsiteEventsSeries } from 'components/hooks';
import { renderDateLabels } from 'lib/charts';
import { CHART_COLORS } from 'lib/constants';
import { useMemo } from 'react';

export interface EventsChartProps {
  websiteId: string;
  className?: string;
}

export function EventsChart({ websiteId, className }: EventsChartProps) {
  const {
    dateRange: { startDate, endDate, unit, value },
  } = useDateRange(websiteId);
  const { locale } = useLocale();
  const { data, isLoading } = useWebsiteEventsSeries(websiteId);

  const chartData = useMemo(() => {
    if (!data) return [];

    const map = (data as any[]).reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ x: t, y });

      return obj;
    }, {});

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

  return (
    <BarChart
      minDate={startDate.toISOString()}
      maxDate={endDate.toISOString()}
      className={className}
      data={chartData}
      unit={unit}
      stacked={true}
      renderXLabel={renderDateLabels(unit, locale)}
      isLoading={isLoading}
      isAllTime={value === 'all'}
    />
  );
}

export default EventsChart;
