import { colord } from 'colord';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { useLocale, useMessages } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { DATE_FORMATS, DATE_FUNCTIONS, formatDate, generateTimeSeries } from '@/lib/date';

export interface RevenueChartProps {
  data: { x: string; t: string; y: number; count: number }[];
  mode?: 'period' | 'cumulative';
  unit: string;
  minDate: Date;
  maxDate: Date;
  currency: string;
}

export function RevenueChart({
  data,
  mode = 'period',
  unit,
  minDate,
  maxDate,
  currency,
}: RevenueChartProps) {
  const { t, labels } = useMessages();
  const { locale, dateLocale } = useLocale();
  const isCumulative = mode === 'cumulative';

  const chartData: any = useMemo(() => {
    if (!data?.length) return { datasets: [] };

    if (isCumulative) {
      const cumulativeMaxDate = maxDate > new Date() ? new Date() : maxDate;
      const cutoff = formatDate(cumulativeMaxDate, DATE_FORMATS[unit], dateLocale);
      const bucketDates = getBucketDates(minDate, maxDate, unit, dateLocale);
      const totals = data.reduce(
        (obj, { t, y }) => {
          obj[t] = (obj[t] || 0) + y;
          return obj;
        },
        {} as Record<string, number>,
      );

      let total = 0;
      const timeseries = generateTimeSeries(
        Object.entries(totals).map(([x, y]) => ({ x, y })),
        minDate,
        maxDate,
        unit,
        dateLocale,
      ).map(point => {
        const d = point.d ?? bucketDates.get(point.x);

        if (point.x > cutoff) {
          return {
            ...point,
            d,
            y: null,
          };
        }

        total += point.y || 0;

        return {
          ...point,
          d,
          y: total,
        };
      });

      const color = colord(CHART_COLORS[0]);

      return {
        datasets: [
          {
            type: 'line',
            label: t(labels.revenue),
            data: timeseries,
            backgroundColor: (context: any) => {
              const { chart } = context;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                return color.alpha(0.18).toRgbString();
              }

              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, color.alpha(0.22).toRgbString());
              gradient.addColorStop(1, color.alpha(0.02).toRgbString());

              return gradient;
            },
            borderColor: color.alpha(0.95).toRgbString(),
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.25,
            fill: true,
          },
        ],
      };
    }

    const map = data.reduce(
      (obj, { x, t, y }) => {
        if (!obj[x]) obj[x] = [];
        obj[x].push({ x: t, y });
        return obj;
      },
      {} as Record<string, { x: string; y: number }[]>,
    );

    return {
      datasets: Object.keys(map).map((key, index) => {
        const color = colord(CHART_COLORS[index % CHART_COLORS.length]);
        return {
          label: key,
          data: generateTimeSeries(map[key], minDate, maxDate, unit, dateLocale),
          backgroundColor: color.alpha(0.6).toRgbString(),
          borderColor: color.alpha(0.7).toRgbString(),
          borderWidth: 1,
        };
      }),
    };
  }, [data, minDate, maxDate, unit, dateLocale, isCumulative, t, labels.revenue]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <BarChart
      chartData={chartData}
      unit={unit}
      minDate={minDate}
      maxDate={maxDate}
      currency={currency}
      stacked={!isCumulative}
      renderXLabel={renderXLabel}
      height="400px"
    />
  );
}

function getBucketDates(minDate: Date, maxDate: Date, unit: string, locale: string) {
  const add = DATE_FUNCTIONS[unit].add;
  const start = DATE_FUNCTIONS[unit].start;
  const fmt = DATE_FORMATS[unit];
  const dates = new Map<string, Date>();

  let current = start(minDate);
  const end = start(maxDate);

  while (current <= end) {
    dates.set(formatDate(current, fmt, locale), current);
    current = add(current, 1);
  }

  return dates;
}
