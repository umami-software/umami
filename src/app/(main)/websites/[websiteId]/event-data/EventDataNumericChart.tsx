'use client';
import { Column } from '@umami/react-zen';
import { useTheme } from '@umami/react-zen';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useEventDataNumericSeriesQuery,
  useLocale,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { generateTimeSeries } from '@/lib/date';
import type { EventPropertyFilter } from '@/lib/types';

export function EventDataNumericChart({
  websiteId,
  eventName,
  propertyName,
  eventFilters = [],
}: {
  websiteId: string;
  eventName: string;
  propertyName: string;
  eventFilters?: EventPropertyFilter[];
}) {
  const { t, labels } = useMessages();
  const { theme } = useTheme();
  const { timezone } = useTimezone();
  const { dateRange: { startDate, endDate, unit } } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const sumQuery = useEventDataNumericSeriesQuery(
    websiteId,
    eventName,
    propertyName,
    'sum',
    eventFilters,
  );
  const avgQuery = useEventDataNumericSeriesQuery(
    websiteId,
    eventName,
    propertyName,
    'avg',
    eventFilters,
  );

  const chartData: any = useMemo(() => {
    if (!sumQuery.data && !avgQuery.data) return;

    const sumRows = (sumQuery.data as { t: string; y: number }[] | undefined) ?? [];
    const avgRows = (avgQuery.data as { t: string; y: number }[] | undefined) ?? [];

    return {
      datasets: [
        {
          type: 'bar',
          label: t(labels.sum),
          data: generateTimeSeries(
            sumRows.map(({ t, y }) => ({ x: t, y })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
          borderWidth: 1,
        },
        {
          type: 'bar',
          label: t(labels.average),
          data: generateTimeSeries(
            avgRows.map(({ t, y }) => ({ x: t, y })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.views,
          borderWidth: 1,
        },
      ],
    };
  }, [sumQuery.data, avgQuery.data, t, labels, startDate, endDate, unit, dateLocale, colors]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <Column gap="4">
      <LoadingPanel
        isLoading={sumQuery.isLoading || avgQuery.isLoading}
        error={sumQuery.error || avgQuery.error}
        minHeight="400px"
      >
        {chartData && (
          <BarChart
            chartData={chartData}
            minDate={startDate}
            maxDate={endDate}
            unit={unit}
            stacked={false}
            renderXLabel={renderXLabel}
            height="400px"
          />
        )}
      </LoadingPanel>
    </Column>
  );
}
