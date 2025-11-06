import { useMemo, useState, useEffect } from 'react';
import { colord } from 'colord';
import { BarChart, BarChartProps } from '@/components/charts/BarChart';
import { useDateRange, useLocale, useWebsiteEventsSeriesQuery } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export interface EventsChartProps extends BarChartProps {
  websiteId: string;
  focusLabel?: string;
}

export function EventsChart({ websiteId, focusLabel }: EventsChartProps) {
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange();
  const { locale } = useLocale();
  const { data, isLoading, error } = useWebsiteEventsSeriesQuery(websiteId);
  const [label, setLabel] = useState<string>(focusLabel);

  const chartData: any = useMemo(() => {
    if (!data) return;

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
      focusLabel,
    };
  }, [data, startDate, endDate, unit, focusLabel]);

  useEffect(() => {
    if (label !== focusLabel) {
      setLabel(focusLabel);
    }
  }, [focusLabel]);

  return (
    <LoadingPanel isLoading={isLoading} error={error} minHeight="400px">
      {chartData && (
        <BarChart
          chartData={chartData}
          minDate={startDate}
          maxDate={endDate}
          unit={unit}
          stacked={true}
          renderXLabel={renderDateLabels(unit, locale)}
          height="400px"
        />
      )}
    </LoadingPanel>
  );
}
