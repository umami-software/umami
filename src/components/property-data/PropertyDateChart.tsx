'use client';
import { Column, Grid, Text, useTheme } from '@umami/react-zen';
import {
  differenceInCalendarDays,
  format,
  formatDistance,
  isValid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  type Locale,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { type ReactNode, useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useLocale, useMessages, usePropertyDateSeriesQuery, useTimezone } from '@/components/hooks';
import type { PropertyDataSource } from '@/components/hooks/queries/usePropertyFieldsQuery';
import { ListTable } from '@/components/metrics/ListTable';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { CHART_COLORS } from '@/lib/constants';
import { formatDate, generateTimeSeries } from '@/lib/date';
import type { EventDataDateSeriesPoint, PropertyFilter } from '@/lib/types';

type DateChartUnit = 'day' | 'week' | 'month' | 'year';
type ParsedDateRow = EventDataDateSeriesPoint & { date: Date };

function parseDateValue(value: string) {
  const normalized = value?.trim().replace(' ', 'T').replace(/Z$/, '').replace(/\.\d+$/, '');
  const [datePart = '', timePart = '00:00:00'] = normalized.split('T');
  const [year = 0, month = 1, day = 1] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute, second);

  return isValid(date) ? date : null;
}

function InsightCard({ label, value, hint }: { label: string; value: string; hint?: ReactNode }) {
  return (
    <Column
      justifyContent="center"
      paddingX="6"
      paddingY="4"
      borderRadius
      backgroundColor="surface-base"
      border
      gap="2"
      height="100%"
      style={{ minWidth: 0 }}
    >
      <Text weight="bold" style={{ overflowWrap: 'anywhere' }}>{label}</Text>
      <Text weight="bold" style={{ overflowWrap: 'anywhere' }}>{value}</Text>
      {hint && <Text color="muted" style={{ overflowWrap: 'anywhere' }}>{hint}</Text>}
    </Column>
  );
}

function getChartUnit(minDate: Date, maxDate: Date): DateChartUnit {
  const spanDays = differenceInCalendarDays(maxDate, minDate);
  if (spanDays <= 45) return 'day';
  if (spanDays <= 180) return 'week';
  if (spanDays <= 730) return 'month';
  return 'year';
}

function getBucketStart(date: Date, unit: DateChartUnit, dateLocale: Locale) {
  switch (unit) {
    case 'week':
      return startOfWeek(date, { locale: dateLocale });
    case 'month':
      return startOfMonth(date);
    case 'year':
      return startOfYear(date);
    default:
      return startOfDay(date);
  }
}

export function PropertyDateChart({
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
  const { theme } = useTheme();
  const { t, labels } = useMessages();
  const { locale, dateLocale } = useLocale();
  const { timezone } = useTimezone();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const query = usePropertyDateSeriesQuery(source, websiteId, propertyName, propertyFilters, eventName);

  const rows = useMemo(() => query.data ?? [], [query.data]);
  const total = useMemo(() => rows.reduce((sum, { y }) => sum + y, 0), [rows]);
  const zonedNow = useMemo(() => toZonedTime(new Date(), timezone), [timezone]);

  const exactDateRows = useMemo(
    () =>
      rows
        .map(row => {
          const date = parseDateValue(row.t);
          return date ? { ...row, date } : null;
        })
        .filter((row): row is ParsedDateRow => row !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [rows],
  );

  const minPropertyDate = exactDateRows[0]?.date ?? null;
  const maxPropertyDate = exactDateRows[exactDateRows.length - 1]?.date ?? null;
  const chartUnit = useMemo(
    () => (minPropertyDate && maxPropertyDate ? getChartUnit(minPropertyDate, maxPropertyDate) : 'day'),
    [maxPropertyDate, minPropertyDate],
  );

  const chartRows = useMemo(() => {
    if (!exactDateRows.length) return [];
    const buckets = exactDateRows.reduce(
      (obj, row) => {
        const bucketStart = getBucketStart(row.date, chartUnit, dateLocale);
        const bucketKey = format(bucketStart, "yyyy-MM-dd'T'HH:mm:ss");
        obj[bucketKey] = {
          t: bucketKey,
          y: (obj[bucketKey]?.y ?? 0) + row.y,
        };
        return obj;
      },
      {} as Record<string, EventDataDateSeriesPoint>,
    );
    return Object.values(buckets).sort(
      (a, b) => (parseDateValue(a.t)?.getTime() ?? 0) - (parseDateValue(b.t)?.getTime() ?? 0),
    );
  }, [chartUnit, dateLocale, exactDateRows]);

  const chartData: any = useMemo(() => {
    if (!minPropertyDate || !maxPropertyDate) {
      return {
        datasets: [
          {
            label: t(labels.count),
            data: [],
            barPercentage: 0.9,
            categoryPercentage: 0.9,
            ...colors.chart.visitors,
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      datasets: [
        {
          label: t(labels.count),
          data: generateTimeSeries(
            chartRows.map(({ t, y }) => ({ x: t, y })),
            minPropertyDate,
            maxPropertyDate,
            chartUnit,
            dateLocale,
          ),
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
          borderWidth: 1,
        },
      ],
    };
  }, [chartRows, chartUnit, colors, dateLocale, labels.count, maxPropertyDate, minPropertyDate, t]);

  const renderXLabel = useCallback(renderDateLabels(chartUnit, locale), [chartUnit, locale]);

  const weekdayTableData = useMemo(() => {
    if (!exactDateRows.length || total === 0) return [];
    const weekStartsOn = dateLocale.options?.weekStartsOn ?? 0;
    const weekdayOrder = Array.from({ length: 7 }, (_, index) => (weekStartsOn + index) % 7);
    const weekdayTotals = exactDateRows.reduce(
      (obj, { date, y }) => {
        const day = date.getDay();
        obj[day] = (obj[day] ?? 0) + y;
        return obj;
      },
      {} as Record<number, number>,
    );

    return weekdayOrder.map(day => {
      const referenceDate = new Date(2026, 0, 4 + day);
      const count = weekdayTotals[day] ?? 0;

      return {
        label: format(referenceDate, 'EEEE', { locale: dateLocale }),
        count,
        percent: total ? 100 * (count / total) : 0,
      };
    });
  }, [dateLocale, exactDateRows, total]);

  const topDateByDay = useMemo(() => {
    if (!exactDateRows.length || total === 0) return null;
    const dayTotals = exactDateRows.reduce(
      (obj, { date, y }) => {
        const dayDate = startOfDay(date);
        const key = format(dayDate, 'yyyy-MM-dd');
        obj[key] = { date: dayDate, count: (obj[key]?.count ?? 0) + y };
        return obj;
      },
      {} as Record<string, { date: Date; count: number }>,
    );
    return Object.values(dayTotals).sort((a, b) => b.count - a.count || b.date.getTime() - a.date.getTime())[0];
  }, [exactDateRows, total]);

  const topWeekday = useMemo(() => [...weekdayTableData].sort((a, b) => b.count - a.count)[0], [weekdayTableData]);
  const weekdayLabels = useMemo(() => weekdayTableData.map(({ label }) => label), [weekdayTableData]);
  const weekdayColorMap = useMemo(
    () =>
      weekdayLabels.reduce((obj, label, index) => {
        obj[label] = CHART_COLORS[index % CHART_COLORS.length];
        return obj;
      }, {} as Record<string, string>),
    [weekdayLabels],
  );

  const weekdayPieChartData = useMemo(() => {
    if (!weekdayTableData.length) return null;
    return {
      labels: weekdayLabels,
      datasets: [
        {
          data: weekdayTableData.map(({ count }) => count),
          backgroundColor: weekdayLabels.map(label => weekdayColorMap[label]),
          borderWidth: 0,
        },
      ],
    };
  }, [weekdayColorMap, weekdayLabels, weekdayTableData]);

  return (
    <Column gap="4">
      <LoadingPanel isLoading={query.isLoading} isFetching={query.isFetching} error={query.error} minHeight="100px">
        <MetricsBar padding="2">
          <InsightCard
            label="Top weekday"
            value={topWeekday?.label ?? 'None'}
            hint={topWeekday ? `${topWeekday.count.toLocaleString(locale)} count - ${Math.round(topWeekday.percent)}%` : undefined}
          />
          <InsightCard
            label="Top date"
            value={topDateByDay ? formatDate(topDateByDay.date, 'PP', locale) : 'None'}
            hint={topDateByDay ? `${topDateByDay.count.toLocaleString(locale)} count - ${Math.round((topDateByDay.count / total) * 100)}%` : undefined}
          />
          <InsightCard
            label="Earliest date"
            value={minPropertyDate ? formatDate(minPropertyDate, 'PP', locale) : 'None'}
            hint={minPropertyDate ? formatDistance(minPropertyDate, zonedNow, { addSuffix: true }) : undefined}
          />
          <InsightCard
            label="Latest date"
            value={maxPropertyDate ? formatDate(maxPropertyDate, 'PP', locale) : 'None'}
            hint={maxPropertyDate ? formatDistance(maxPropertyDate, zonedNow, { addSuffix: true }) : undefined}
          />
        </MetricsBar>
      </LoadingPanel>
      <LoadingPanel isLoading={query.isLoading} error={query.error} minHeight="400px">
        {chartData && (
          <BarChart
            chartData={chartData}
            minDate={minPropertyDate ?? new Date()}
            maxDate={maxPropertyDate ?? new Date()}
            unit={chartUnit}
            stacked={false}
            renderXLabel={renderXLabel}
            height="400px"
          />
        )}
      </LoadingPanel>
      <LoadingPanel
        data={weekdayTableData}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        minHeight="300px"
      >
        <Grid columns={{ base: '1fr', md: '1fr 1fr' }} gap padding="2" alignItems="start">
          <ListTable title={propertyName} metric={t(labels.count)} data={weekdayTableData} />
          {weekdayPieChartData && <PieChart type="doughnut" chartData={weekdayPieChartData} />}
        </Grid>
      </LoadingPanel>
    </Column>
  );
}
