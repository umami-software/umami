import { useTheme } from '@umami/react-zen';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import type { GoogleAdsRow } from '@/components/hooks';
import { useLocale } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { DATE_FUNCTIONS, generateTimeSeries } from '@/lib/date';

type DailyRow = Pick<GoogleAdsRow, 'key' | 'conversions'>;

export interface GoogleAdsConversionsChartProps {
  /** One row per day, keyed by YYYY-MM-DD. */
  rows: DailyRow[];
  minDate: Date;
  maxDate: Date;
  unit: string;
}

/** Sums daily rows into the chart's unit. Google has no data finer than a day. */
function bucket(rows: DailyRow[], unit: string) {
  const start = DATE_FUNCTIONS[unit].start;
  const totals = new Map<string, number>();

  for (const row of rows) {
    // Parsed as local midnight, so the day does not shift with the viewer's UTC offset.
    const x = format(start(new Date(`${row.key}T00:00:00`)), "yyyy-MM-dd'T'HH:mm:ss");
    totals.set(x, (totals.get(x) || 0) + row.conversions);
  }

  // Fractional attribution leaves float noise when days are summed.
  return [...totals].map(([x, y]) => ({ x, y: Number(y.toFixed(2)) }));
}

export function GoogleAdsConversionsChart({
  rows,
  minDate,
  maxDate,
  unit,
}: GoogleAdsConversionsChartProps) {
  const t = useTranslations('googleAds');
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
          label: t('conversions'),
          data: generateTimeSeries(
            bucket(rows, chartUnit),
            minDate,
            maxDate,
            chartUnit,
            dateLocale,
          ),
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
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
      height="300px"
    />
  );
}
