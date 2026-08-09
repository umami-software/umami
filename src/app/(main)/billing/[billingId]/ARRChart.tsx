'use client';
import { useTheme } from '@umami/react-zen';
import { colord } from 'colord';
import { useMemo } from 'react';
import { Chart } from '@/components/charts/Chart';
import { useLocale } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { formatDate } from '@/lib/date';
import { formatLongCurrency } from '@/lib/format';
import type { ARRMetrics } from '@/queries/sql/billing/getARR';
import { ARR_SERIES, computeYoYGrowth, YOY_GROWTH_COLOR } from './arr';

export interface ARRChartProps {
  data: ARRMetrics[];
  currency?: string;
}

export function ARRChart({ data, currency = 'USD' }: ARRChartProps) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const chartData: any = useMemo(() => {
    if (!data?.length) return { labels: [], datasets: [] };

    const labels = data.map(row => formatDate(`${row.month}-01`, 'MMM yyyy', locale));
    const growth = computeYoYGrowth(data);

    return {
      labels,
      datasets: [
        ...ARR_SERIES.map(({ key, label, color }) => ({
          type: 'bar',
          label,
          data: data.map(row => row[key]),
          backgroundColor: colord(color).alpha(0.85).toRgbString(),
          borderRadius: 2,
          stack: 'arr',
          yAxisID: 'y',
          order: 2,
        })),
        {
          type: 'line',
          label: 'YoY Growth',
          data: growth,
          borderColor: YOY_GROWTH_COLOR,
          backgroundColor: YOY_GROWTH_COLOR,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: YOY_GROWTH_COLOR,
          tension: 0.3,
          spanGaps: false,
          yAxisID: 'y1',
          order: 1,
        },
      ],
    };
  }, [data, locale]);

  const chartOptions: any = useMemo(() => {
    return {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (item: any) => {
              if (item.dataset.yAxisID === 'y1') {
                return item.raw == null
                  ? undefined
                  : `${item.dataset.label}: ${Number(item.raw).toFixed(1)}%`;
              }
              return `${item.dataset.label}: ${formatLongCurrency(item.raw, currency)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          border: { color: colors.chart.line },
          ticks: { color: colors.chart.text, autoSkip: true, maxRotation: 0 },
        },
        y: {
          stacked: true,
          position: 'left',
          grid: { color: colors.chart.line },
          border: { color: colors.chart.line },
          ticks: {
            color: colors.chart.text,
            callback: (value: number) => formatLongCurrency(Number(value), currency),
          },
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          border: { color: colors.chart.line },
          ticks: {
            color: colors.chart.text,
            callback: (value: number) => `${value}%`,
          },
        },
      },
    };
  }, [colors, currency]);

  return <Chart type="bar" chartData={chartData} chartOptions={chartOptions} height="400px" />;
}
