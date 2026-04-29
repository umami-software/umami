'use client';
import { Column, useTheme } from '@umami/react-zen';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useLocale,
  useMessages,
  usePropertyNumericSeriesQuery,
  usePropertyNumericStatsQuery,
  useTimezone,
} from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { generateTimeSeries } from '@/lib/date';
import { formatLongNumber } from '@/lib/format';
import type { PropertyFilter } from '@/lib/types';

export function PropertyNumericChart({
  source,
  websiteId,
  propertyName,
  propertyFilters = [],
  eventName,
}: {
  source: PropertyDataSource;
  websiteId: string;
  propertyName: string;
  propertyFilters?: PropertyFilter[];
  eventName?: string;
}) {
  const { t, labels } = useMessages();
  const { theme } = useTheme();
  const { timezone } = useTimezone();
  const { dateRange: { startDate, endDate, unit } } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const sumQuery = usePropertyNumericSeriesQuery(source, websiteId, propertyName, 'sum', propertyFilters, eventName);
  const avgQuery = usePropertyNumericSeriesQuery(source, websiteId, propertyName, 'avg', propertyFilters, eventName);
  const statsQuery = usePropertyNumericStatsQuery(source, websiteId, propertyName, propertyFilters, eventName);

  const sumRows = useMemo(() => (sumQuery.data as { t: string; y: number }[] | undefined) ?? [], [sumQuery.data]);
  const avgRows = useMemo(() => (avgQuery.data as { t: string; y: number }[] | undefined) ?? [], [avgQuery.data]);
  const stats = statsQuery.data;

  const formatMetricValue = useCallback(
    (n: number) =>
      Number(n).toLocaleString(locale, {
        maximumFractionDigits: 2,
        minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2,
      }),
    [locale],
  );

  const chartData: any = useMemo(() => {
    if (!sumQuery.data && !avgQuery.data) return;

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
  }, [avgQuery.data, avgRows, colors, dateLocale, endDate, labels.average, labels.sum, startDate, sumQuery.data, sumRows, t, unit]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <Column gap="4">
      <LoadingPanel
        data={stats}
        isLoading={sumQuery.isLoading || avgQuery.isLoading || statsQuery.isLoading}
        isFetching={sumQuery.isFetching || avgQuery.isFetching || statsQuery.isFetching}
        error={sumQuery.error || avgQuery.error || statsQuery.error}
        minHeight="100px"
      >
        <MetricsBar padding="2">
          <MetricCard label={t(labels.total)} value={stats?.total ?? 0} formatValue={formatLongNumber} />
          <MetricCard label={t(labels.average)} value={stats?.average ?? 0} formatValue={formatMetricValue} />
          <MetricCard label="Median" value={stats?.median ?? 0} formatValue={formatMetricValue} />
          <MetricCard label={t(labels.max)} value={stats?.max ?? 0} formatValue={formatMetricValue} />
          <MetricCard label={t(labels.min)} value={stats?.min ?? 0} formatValue={formatMetricValue} />
        </MetricsBar>
      </LoadingPanel>
      <LoadingPanel
        isLoading={sumQuery.isLoading || avgQuery.isLoading || statsQuery.isLoading}
        error={sumQuery.error || avgQuery.error || statsQuery.error}
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
