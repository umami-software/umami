'use client';
import { Column, Grid } from '@umami/react-zen';
import { colord } from 'colord';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import {
  useDateRange,
  useLocale,
  useMessages,
  usePropertyArraySeriesQuery,
  usePropertySeriesQuery,
  usePropertyValuesQuery,
  useTimezone,
} from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { ListTable } from '@/components/metrics/ListTable';
import { getPropertyTableData } from '@/components/property-data/getPropertyTableData';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS, DATA_TYPE } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';
import type { EventDataSeriesPoint, PropertyFilter } from '@/lib/types';

// Below this width the board view stacks the list above the pie, like the UTM board component.
const STACKED_LAYOUT_WIDTH = 900;

export function PropertyChart({
  source,
  websiteId,
  propertyName,
  propertyFilters = [],
  eventName,
  seriesType = 'property',
  showSeriesChart = true,
  limit,
}: {
  source: PropertyDataSource;
  websiteId: string;
  propertyName: string;
  propertyFilters?: PropertyFilter[];
  eventName?: string;
  seriesType?: 'property' | 'array';
  showSeriesChart?: boolean;
  limit?: number;
}) {
  const { t, labels } = useMessages();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);
  const { timezone } = useTimezone();
  const {
    dateRange: { startDate, endDate, unit },
  } = useDateRange({ timezone });
  const { locale, dateLocale } = useLocale();
  const propertySeriesQuery = usePropertySeriesQuery(
    source,
    websiteId,
    propertyName,
    propertyFilters,
    eventName,
    { enabled: showSeriesChart && seriesType === 'property' },
  );
  const arraySeriesQuery = usePropertyArraySeriesQuery(
    source,
    websiteId,
    propertyName,
    propertyFilters,
    eventName,
    { enabled: showSeriesChart && seriesType === 'array' },
  );
  // Without the series chart only the value totals are needed. The values endpoint covers every
  // data type, while the series endpoint only returns strings and booleans.
  const valuesQuery = usePropertyValuesQuery(
    source,
    websiteId,
    propertyName,
    seriesType === 'array' ? DATA_TYPE.array : undefined,
    propertyFilters,
    eventName,
    { enabled: !showSeriesChart && !!(websiteId && propertyName) },
  );
  const seriesQuery = seriesType === 'array' ? arraySeriesQuery : propertySeriesQuery;
  const { data, isLoading, isFetching, error } = showSeriesChart ? seriesQuery : valuesQuery;

  const aggregated = useMemo(() => {
    if (!data) return [];

    if (!showSeriesChart) {
      return (data as { value: string; total: number }[])
        .map(({ value, total }) => ({ value: String(value), total: Number(total) }))
        .sort((a, b) => b.total - a.total);
    }

    const totals = (data as EventDataSeriesPoint[]).reduce(
      (obj: Record<string, number>, { x, y }) => {
        obj[x] = (obj[x] ?? 0) + y;
        return obj;
      },
      {},
    );
    return Object.entries(totals)
      .map(([value, total]) => ({ value, total: total as number }))
      .sort((a, b) => b.total - a.total);
  }, [data, showSeriesChart]);
  const limited = useMemo(
    () => (limit ? aggregated.slice(0, limit) : aggregated),
    [aggregated, limit],
  );

  const valueLabels = useMemo(() => aggregated.map(({ value }) => value), [aggregated]);
  const colorMap = useMemo(
    () =>
      valueLabels.reduce(
        (obj, label, index) => {
          obj[label] = CHART_COLORS[index % CHART_COLORS.length];
          return obj;
        },
        {} as Record<string, string>,
      ),
    [valueLabels],
  );

  const chartData = useMemo(() => {
    if (!data || !showSeriesChart) return;

    const map = (data as EventDataSeriesPoint[]).reduce(
      (obj: Record<string, EventDataSeriesPoint[]>, { x, t, y }) => {
        if (!obj[x]) obj[x] = [];
        obj[x].push({ x, t, y });
        return obj;
      },
      {},
    );

    if (!Object.keys(map).length) {
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
  }, [data, showSeriesChart, startDate, endDate, unit, dateLocale, valueLabels, colorMap]);

  useEffect(() => {
    if (showSeriesChart || typeof ResizeObserver === 'undefined' || !wrapperRef.current) {
      return;
    }

    const element = wrapperRef.current;
    const resizeObserver = new ResizeObserver(() => {
      const width = element.clientWidth;
      setIsStacked(width > 0 && width < STACKED_LAYOUT_WIDTH);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [showSeriesChart]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);
  const tableData = useMemo(() => getPropertyTableData(aggregated, limit), [aggregated, limit]);
  const pieChartData = useMemo(() => {
    if (!limited.length) return null;
    return {
      labels: limited.map(({ value }) => value),
      datasets: [
        {
          data: limited.map(({ total }) => total),
          backgroundColor: limited.map(({ value }) => colorMap[value]),
          borderWidth: 0,
        },
      ],
    };
  }, [limited, colorMap]);

  const breakdown = (
    <LoadingPanel
      data={tableData}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="300px"
    >
      <Grid
        columns={
          showSeriesChart
            ? { base: '1fr', md: '1fr 1fr' }
            : isStacked
              ? 'minmax(0, 1fr)'
              : 'minmax(0, 1fr) minmax(0, 1fr)'
        }
        gap
        padding="2"
        alignItems="start"
      >
        <ListTable title={propertyName} metric={t(labels.count)} data={tableData} />
        {pieChartData && <PieChart type="doughnut" chartData={pieChartData} />}
      </Grid>
    </LoadingPanel>
  );

  if (!showSeriesChart) {
    return <div ref={wrapperRef}>{breakdown}</div>;
  }

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
      {breakdown}
    </Column>
  );
}
