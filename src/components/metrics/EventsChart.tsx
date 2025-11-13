import { BarChart, BarChartProps } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useLocale,
  useTimezone,
  useWebsiteEventsSeriesQuery,
} from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import { colord } from 'colord';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface EventsChartProps extends BarChartProps {
  websiteId: string;
  focusLabel?: string;
}

export function EventsChart({ websiteId, focusLabel }: EventsChartProps) {
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone: timezone });
  const { locale, dateLocale } = useLocale();
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

    if (!map || Object.keys(map).length === 0) {
      return {
        datasets: [
          {
            data: generateTimeSeries([], startDate, endDate, unit, dateLocale),
            lineTension: 0,
            borderWidth: 1,
          },
        ],
      };
    } else {
      return {
        datasets: Object.keys(map).map((key, index) => {
          const color = colord(CHART_COLORS[index % CHART_COLORS.length]);
          return {
            label: key,
            data: generateTimeSeries(map[key], startDate, endDate, unit, dateLocale),
            lineTension: 0,
            backgroundColor: color.alpha(0.6).toRgbString(),
            borderColor: color.alpha(0.7).toRgbString(),
            borderWidth: 1,
          };
        }),
        focusLabel,
      };
    }
  }, [data, startDate, endDate, unit, focusLabel]);

  useEffect(() => {
    if (label !== focusLabel) {
      setLabel(focusLabel);
    }
  }, [focusLabel]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <LoadingPanel isLoading={isLoading} error={error} minHeight="400px">
      {chartData && (
        <BarChart
          chartData={chartData}
          minDate={startDate}
          maxDate={endDate}
          unit={unit}
          stacked={true}
          renderXLabel={renderXLabel}
          height="400px"
        />
      )}
    </LoadingPanel>
  );
}
