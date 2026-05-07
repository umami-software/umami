import { useTheme } from '@umami/react-zen';
import { useCallback, useMemo } from 'react';
import { BarChart, type BarChartProps } from '@/components/charts/BarChart';
import { useLocale } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { generateTimeSeries } from '@/lib/date';
import { formatShortTime } from '@/lib/format';

export type MetricSeriesKind = 'bouncerate' | 'visitduration';

export interface MetricSeriesChartProps extends BarChartProps {
  data: {
    series: { x: string; y: number }[];
    compare?: { x: string; y: number }[];
  };
  unit: string;
  kind: MetricSeriesKind;
  label: string;
  comparePreviousLabel?: string;
}

const formatPercent = (value: number) => `${Math.round(Number(value))}%`;
const formatDuration = (value: number) =>
  formatShortTime(Math.max(0, Math.round(Number(value))), ['m', 's'], ' ');

export function MetricSeriesChart({
  data,
  unit,
  minDate,
  maxDate,
  kind,
  label,
  comparePreviousLabel,
  ...props
}: MetricSeriesChartProps) {
  const { theme } = useTheme();
  const { locale, dateLocale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const formatY = kind === 'bouncerate' ? formatPercent : formatDuration;

  const chartData: any = useMemo(() => {
    if (!data) return;

    const yMaxBaseline = kind === 'bouncerate' ? 100 : undefined;

    return {
      __id: Date.now(),
      yMax: yMaxBaseline,
      datasets: [
        {
          type: 'bar',
          label,
          data: generateTimeSeries(data.series, minDate, maxDate, unit, dateLocale),
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.9,
          ...colors.chart.visitors,
          order: 2,
        },
        ...(data.compare
          ? [
              {
                type: 'line',
                label: comparePreviousLabel ?? `${label} (previous)`,
                data: generateTimeSeries(data.compare, minDate, maxDate, unit, dateLocale),
                borderWidth: 2,
                backgroundColor: '#8601B0',
                borderColor: '#8601B0',
                order: 1,
              },
            ]
          : []),
      ],
    };
  }, [data, locale, kind, label, comparePreviousLabel, colors, minDate, maxDate, unit, dateLocale]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);
  const renderYLabel = useCallback((value: any) => formatY(Number(value)), [formatY]);
  const renderTooltipValue = useCallback(
    (raw: { x: any; y: number }) => formatY(Number(raw?.y)),
    [formatY],
  );

  return (
    <BarChart
      {...props}
      chartData={chartData}
      unit={unit}
      minDate={minDate}
      maxDate={maxDate}
      renderXLabel={renderXLabel}
      renderYLabel={renderYLabel}
      renderTooltipValue={renderTooltipValue}
      height="400px"
    />
  );
}
