import { useTheme } from '@umami/react-zen';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import type { SearchConsoleRow } from '@/components/hooks';
import { useLocale } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { DATE_FUNCTIONS, generateTimeSeries } from '@/lib/date';

export interface SearchConsoleChartProps {
  /** One row per day, keyed by YYYY-MM-DD. */
  rows: SearchConsoleRow[];
  minDate: Date;
  maxDate: Date;
  unit: string;
}

/** Sums daily rows into the chart's unit. Google has no data finer than a day. */
function bucket(rows: SearchConsoleRow[], unit: string, metric: 'clicks' | 'impressions') {
  const start = DATE_FUNCTIONS[unit].start;
  const totals = new Map<string, number>();

  for (const row of rows) {
    // Parsed as local midnight, so the day does not shift with the viewer's UTC offset.
    const x = format(start(new Date(`${row.key}T00:00:00`)), "yyyy-MM-dd'T'HH:mm:ss");
    totals.set(x, (totals.get(x) || 0) + row[metric]);
  }

  return [...totals].map(([x, y]) => ({ x, y }));
}

export function SearchConsoleChart({ rows, minDate, maxDate, unit }: SearchConsoleChartProps) {
  const t = useTranslations('searchConsole');
  const { theme } = useTheme();
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const chartUnit = unit === 'minute' || unit === 'hour' ? 'day' : unit;

  const chartData: any = useMemo(
    () => ({
      __id: Date.now(),
      datasets: [
        {
          type: 'bar',
          label: t('clicks'),
          data: generateTimeSeries(
            bucket(rows, chartUnit, 'clicks'),
            minDate,
            maxDate,
            chartUnit,
            dateLocale,
          ),
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
          order: 1,
        },
        {
          type: 'bar',
          label: t('impressions'),
          data: generateTimeSeries(
            bucket(rows, chartUnit, 'impressions'),
            minDate,
            maxDate,
            chartUnit,
            dateLocale,
          ),
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.views,
          order: 2,
        },
      ],
    }),
    [rows, chartUnit, minDate, maxDate, dateLocale, colors, t],
  );

  const renderXLabel = useCallback(renderDateLabels(chartUnit, locale), [chartUnit, locale]);

  return (
    <BarChart
      chartData={chartData}
      unit={chartUnit}
      minDate={minDate}
      maxDate={maxDate}
      renderXLabel={renderXLabel}
      height="400px"
    />
  );
}
