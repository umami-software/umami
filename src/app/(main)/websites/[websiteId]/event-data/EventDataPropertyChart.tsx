'use client';
import { Column, Grid } from '@umami/react-zen';
import { colord } from 'colord';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useEventDataArraySeriesQuery,
  useDateRange,
  useEventDataPropertySeriesQuery,
  useLocale,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import type { EventDataSeriesPoint, EventPropertyFilter } from '@/lib/types';

export function EventDataPropertyChart({
  websiteId,
  eventName,
  propertyName,
  eventFilters = [],
  seriesType = 'property',
}: {
  websiteId: string;
  eventName: string;
  propertyName: string;
  eventFilters?: EventPropertyFilter[];
  seriesType?: 'property' | 'array';
}) {
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const { dateRange: { startDate, endDate, unit } } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();
  const propertySeriesQuery = useEventDataPropertySeriesQuery(
    websiteId,
    eventName,
    propertyName,
    eventFilters,
    { enabled: seriesType === 'property' },
  );
  const arraySeriesQuery = useEventDataArraySeriesQuery(
    websiteId,
    eventName,
    propertyName,
    eventFilters,
    { enabled: seriesType === 'array' },
  );
  const { data, isLoading, isFetching, error } =
    seriesType === 'array' ? arraySeriesQuery : propertySeriesQuery;

  // Aggregate totals per value from the already-filtered time series
  const aggregated = useMemo(() => {
    if (!data) return [];
    const totals = data.reduce((obj: Record<string, number>, { x, y }) => {
      obj[x] = (obj[x] ?? 0) + y;
      return obj;
    }, {});
    return Object.entries(totals)
      .map(([value, total]) => ({ value, total: total as number }))
      .sort((a, b) => b.total - a.total);
  }, [data]);

  const valueLabels = useMemo(() => aggregated.map(({ value }) => value), [aggregated]);

  const colorMap = useMemo(() => {
    return valueLabels.reduce(
      (obj, label, index) => {
        obj[label] = CHART_COLORS[index % CHART_COLORS.length];
        return obj;
      },
      {} as Record<string, string>,
    );
  }, [valueLabels]);

  const chartData = useMemo(() => {
    if (!data) return;

    const map = data.reduce((obj: Record<string, EventDataSeriesPoint[]>, { x, t, y }) => {
      if (!obj[x]) obj[x] = [];
      obj[x].push({ x, t, y });
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
    }

    const keys = [
      ...valueLabels.filter(label => map[label]),
      ...Object.keys(map).filter(key => !valueLabels.includes(key)),
    ];

    return {
      datasets: keys.map((key, index) => {
        const color = colord(colorMap[key] || CHART_COLORS[index % CHART_COLORS.length]);
        return {
          label: key,
          data: generateTimeSeries(
            map[key].map(({ t, y }) => ({ x: t, y })),
            startDate,
            endDate,
            unit,
            dateLocale,
          ),
          lineTension: 0,
          backgroundColor: color.alpha(0.6).toRgbString(),
          borderColor: color.alpha(0.7).toRgbString(),
          borderWidth: 1,
        };
      }),
    };
  }, [data, startDate, endDate, unit, dateLocale, valueLabels, colorMap]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  const propertySum = useMemo(
    () => aggregated.reduce((sum, { total }) => sum + total, 0),
    [aggregated],
  );

  const tableData = useMemo(() => {
    if (!aggregated.length || propertySum === 0) return [];
    return aggregated.map(({ value, total }) => ({
      label: value,
      count: total,
      percent: 100 * (total / propertySum),
    }));
  }, [aggregated, propertySum]);

  const pieChartData = useMemo(() => {
    if (!aggregated.length) return null;
    return {
      labels: valueLabels,
      datasets: [
        {
          data: aggregated.map(({ total }) => total),
          backgroundColor: valueLabels.map(label => colorMap[label]),
          borderWidth: 0,
        },
      ],
    };
  }, [aggregated, valueLabels, colorMap]);

  return (
    <Column gap="6">
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
      <LoadingPanel
        data={tableData}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        minHeight="300px"
      >
        <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap padding="2" alignItems="start">
          <ListTable title={propertyName} metric={t(labels.count)} data={tableData} />
          {pieChartData && <PieChart type="doughnut" chartData={pieChartData} />}
        </Grid>
      </LoadingPanel>
    </Column>
  );
}
