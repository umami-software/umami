'use client';
import { useTheme } from '@umami/react-zen';
import { colord } from 'colord';
import { useCallback, useMemo, useState } from 'react';
import { Chart } from '@/components/charts/Chart';
import { useLocale } from '@/components/hooks';
import { getThemeColors } from '@/lib/colors';
import { formatDate } from '@/lib/date';
import { formatLongCurrency } from '@/lib/format';
import type { ARRMetrics } from '@/queries/sql/billing/getARR';
import { ARRChartTooltip, type ARRChartTooltipProps } from './ARRChartTooltip';
import {
  ARR_SERIES,
  computeYoYGrowth,
  DISPLAY_MONTHS,
  parseMonthKey,
  YOY_GROWTH_COLOR,
} from './arr';

export interface ARRChartProps {
  data: ARRMetrics[];
  currency?: string;
}

export function ARRChart({ data, currency = 'USD' }: ARRChartProps) {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  const [tooltip, setTooltip] = useState<ARRChartTooltipProps | null>(null);

  // Growth is computed against the full fetched range (which includes a trailing 12-month
  // buffer) so every displayed month has a same-month comparator, then both are sliced down
  // to the display window together so indices stay aligned.
  const growthByIndex = useMemo(() => computeYoYGrowth(data), [data]);
  const displayData = useMemo(() => data.slice(-DISPLAY_MONTHS), [data]);
  const displayGrowth = useMemo(() => growthByIndex.slice(-DISPLAY_MONTHS), [growthByIndex]);

  const chartData: any = useMemo(() => {
    if (!displayData?.length) return { labels: [], datasets: [] };

    const labels = displayData.map(row => formatDate(parseMonthKey(row.month), 'MMM yyyy', locale));

    return {
      labels,
      datasets: [
        ...ARR_SERIES.map(({ key, label, color }) => ({
          type: 'bar',
          label,
          data: displayData.map(row => row[key]),
          backgroundColor: colord(color).alpha(0.85).toRgbString(),
          borderRadius: 2,
          stack: 'arr',
          yAxisID: 'y',
          order: 2,
        })),
        {
          type: 'line',
          label: 'YoY Growth',
          data: displayGrowth,
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
  }, [displayData, displayGrowth, locale]);

  const chartOptions: any = useMemo(() => {
    return {
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

  const handleTooltip = useCallback(
    ({ chart, tooltip }: { chart: any; tooltip: any }) => {
      const { opacity, dataPoints, caretX, caretY } = tooltip;
      if (!opacity || !dataPoints?.length) {
        setTooltip(null);
        return;
      }

      const index = dataPoints[0].dataIndex;
      const row = displayData[index];
      if (!row) {
        setTooltip(null);
        return;
      }

      const growth = displayGrowth[index];
      const canvasRect = chart.canvas.getBoundingClientRect();

      setTooltip({
        position: { x: canvasRect.left + caretX, y: canvasRect.top + caretY },
        title: formatDate(parseMonthKey(row.month), 'MMM yyyy', locale),
        activeKey: dataPoints[0].dataset.label,
        items: ARR_SERIES.map(({ key, label, color }) => ({
          key: label,
          label,
          color,
          value: formatLongCurrency(row[key], currency),
        })),
        total: formatLongCurrency(row.totalSales, currency),
        growth: growth != null ? `${growth.toFixed(1)}%` : null,
      });
    },
    [displayData, displayGrowth, currency, locale],
  );

  return (
    <>
      <Chart
        type="bar"
        chartData={chartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
        height="400px"
      />
      {tooltip && <ARRChartTooltip {...tooltip} />}
    </>
  );
}
