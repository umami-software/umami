'use client';
import { Column, Grid } from '@umami/react-zen';
import { colord } from 'colord';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useEventDataPropertySeriesQuery,
  useEventDataValuesQuery,
  useLocale,
  useMessages,
  useTimezone,
} from '@/components/hooks';
import { ListTable } from '@/components/metrics/ListTable';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';

export function EventDataPropertyChart({
  websiteId,
  eventName,
  propertyName,
}: {
  websiteId: string;
  eventName: string;
  propertyName: string;
}) {
  const { t, labels } = useMessages();
  const { timezone } = useTimezone();
  const { dateRange: { startDate, endDate, unit } } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();
  const { data, isLoading, error } = useEventDataPropertySeriesQuery(websiteId, eventName, propertyName);
  const valuesQuery = useEventDataValuesQuery(websiteId, eventName, propertyName);
  const valueLabels = useMemo(
    () => valuesQuery.data?.map(({ value }) => value) ?? [],
    [valuesQuery.data],
  );
  const colorMap = useMemo(() => {
    return valueLabels.reduce(
      (obj, label, index) => {
        obj[label] = CHART_COLORS[index % CHART_COLORS.length];
        return obj;
      },
      {} as Record<string, string>,
    );
  }, [valueLabels]);

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
      const keys = [
        ...valueLabels.filter(label => map[label]),
        ...Object.keys(map).filter(key => !valueLabels.includes(key)),
      ];

      return {
        datasets: keys.map((key, index) => {
          const color = colord(colorMap[key] || CHART_COLORS[index % CHART_COLORS.length]);
          return {
            label: key,
            data: generateTimeSeries(map[key], startDate, endDate, unit, dateLocale),
            lineTension: 0,
            backgroundColor: color.alpha(0.6).toRgbString(),
            borderColor: color.alpha(0.7).toRgbString(),
            borderWidth: 1,
          };
        }),
      };
    }
  }, [data, startDate, endDate, unit, dateLocale, valueLabels, colorMap]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);
  const propertySum = useMemo(() => {
    return valuesQuery.data?.reduce((sum, { total }) => sum + total, 0) ?? 0;
  }, [valuesQuery.data]);

  const tableData = useMemo(() => {
    if (!valuesQuery.data || propertySum === 0) return [];

    return valuesQuery.data.map(({ value, total }) => ({
      label: value,
      count: total,
      percent: 100 * (total / propertySum),
    }));
  }, [valuesQuery.data, propertySum]);

  const pieChartData: any = useMemo(() => {
    if (!valuesQuery.data?.length) return null;

    return {
      labels: valueLabels,
      datasets: [
        {
          data: valuesQuery.data.map(({ total }) => total),
          backgroundColor: valueLabels.map(label => colorMap[label]),
          borderWidth: 0,
        },
      ],
    };
  }, [valuesQuery.data, valueLabels, colorMap]);

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
        isLoading={valuesQuery.isLoading}
        isFetching={valuesQuery.isFetching}
        error={valuesQuery.error}
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
