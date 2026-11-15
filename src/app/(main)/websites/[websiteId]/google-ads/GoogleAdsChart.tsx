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
import { formatMetric, GOOGLE_ADS_METRICS, type GoogleAdsMetric, sumRows } from './format';

export interface GoogleAdsChartProps {
  /** One row per day, keyed by YYYY-MM-DD. */
  rows: GoogleAdsRow[];
  metric: GoogleAdsMetric;
  currency: string | null;
  minDate: Date;
  maxDate: Date;
  unit: string;
}

/**
 * The metric per chart unit. Google has no data finer than a day. Days are summed before a
 * ratio is taken, so a weekly CTR is the week's clicks over the week's impressions.
 */
function bucket(rows: GoogleAdsRow[], unit: string, metric: GoogleAdsMetric) {
  const start = DATE_FUNCTIONS[unit].start;
  const groups = new Map<string, GoogleAdsRow[]>();

  for (const row of rows) {
    // Parsed as local midnight, so the day does not shift with the viewer's UTC offset.
    const x = format(start(new Date(`${row.key}T00:00:00`)), "yyyy-MM-dd'T'HH:mm:ss");
    groups.set(x, [...(groups.get(x) ?? []), row]);
  }

  return [...groups].map(([x, group]) => ({
    x,
    // Fractional attribution leaves float noise when days are summed.
    y: Number((GOOGLE_ADS_METRICS[metric].get(sumRows(group)) ?? 0).toFixed(6)),
  }));
}

export function GoogleAdsChart({
  rows,
  metric,
  currency,
  minDate,
  maxDate,
  unit,
}: GoogleAdsChartProps) {
  const t = useTranslations('googleAds');
  const { theme } = useTheme();
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const chartUnit = unit === 'minute' || unit === 'hour' ? 'day' : unit;
  const isCount = GOOGLE_ADS_METRICS[metric].format === 'number';

  const chartData: any = useMemo(
    () => ({
      __id: Date.now(),
      datasets: [
        {
          type: 'bar',
          label: t(GOOGLE_ADS_METRICS[metric].label),
          data: generateTimeSeries(
            bucket(rows, chartUnit, metric),
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
    [rows, metric, chartUnit, minDate, maxDate, dateLocale, colors, t],
  );

  const renderXLabel = useCallback(renderDateLabels(chartUnit, locale), [chartUnit, locale]);
  const formatValue = useCallback(
    (value: number) => formatMetric(metric, value, currency, locale),
    [metric, currency, locale],
  );
  const renderYLabel = useCallback((label: string) => formatValue(+label), [formatValue]);

  return (
    <BarChart
      chartData={chartData}
      unit={chartUnit}
      minDate={minDate}
      maxDate={maxDate}
      renderXLabel={renderXLabel}
      // Counts keep the chart's default axis labels.
      renderYLabel={isCount ? undefined : renderYLabel}
      formatValue={formatValue}
      height="400px"
    />
  );
}
