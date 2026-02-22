import { colord } from 'colord';
import { useCallback, useMemo } from 'react';
import { BarChart } from '@/components/charts/BarChart';
import { useLocale } from '@/components/hooks';
import { renderDateLabels } from '@/lib/charts';
import { CHART_COLORS } from '@/lib/constants';
import { generateTimeSeries } from '@/lib/date';

export interface RevenueChartProps {
  data: { x: string; t: string; y: number; count: number }[];
  unit: string;
  minDate: Date;
  maxDate: Date;
  currency: string;
}

export function RevenueChart({ data, unit, minDate, maxDate, currency }: RevenueChartProps) {
  const { locale, dateLocale } = useLocale();

  const chartData: any = useMemo(() => {
    if (!data?.length) return { datasets: [] };

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
  }, [data, minDate, maxDate, unit, dateLocale]);

  const renderXLabel = useCallback(renderDateLabels(unit, locale), [unit, locale]);

  return (
    <BarChart
      chartData={chartData}
      unit={unit}
      minDate={minDate}
      maxDate={maxDate}
      currency={currency}
      stacked={true}
      renderXLabel={renderXLabel}
      height="400px"
    />
  );
}
