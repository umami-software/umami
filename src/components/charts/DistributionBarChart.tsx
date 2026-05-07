'use client';
import { useTheme } from '@umami/react-zen';
import { memo, useCallback, useMemo, useState } from 'react';
import { Chart } from '@/components/charts/Chart';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { renderNumberLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { formatLongNumber } from '@/lib/format';

interface DistributionDatum {
  label: string;
  count: number;
}

interface DistributionDataset {
  label: string;
  values: number[];
  backgroundColor: string;
  borderColor?: string;
}

interface TooltipState {
  title: string;
  color?: string;
  value: string;
}

export interface DistributionBarChartProps {
  data?: DistributionDatum[];
  labels?: string[];
  datasets?: DistributionDataset[];
  height?: string;
  backgroundColor?: string;
  borderColor?: string;
  stacked?: boolean;
  horizontal?: boolean;
}

function DistributionBarChartComponent({
  data,
  labels,
  datasets,
  height = '320px',
  backgroundColor = 'rgba(59, 130, 246, 0.75)',
  borderColor = 'rgba(59, 130, 246, 0.95)',
  stacked = false,
  horizontal = true,
}: DistributionBarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const { theme } = useTheme();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const chartData = useMemo(() => {
    if (datasets?.length && labels?.length) {
      return {
        labels,
        datasets: datasets.map(dataset => ({
          label: dataset.label,
          data: dataset.values,
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor || dataset.backgroundColor,
          borderWidth: 1,
        })),
      };
    }

    return {
      labels: (data || []).map(item => item.label),
      datasets: [
        {
          label: '',
          data: (data || []).map(item => item.count),
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  }, [data, labels, datasets, backgroundColor, borderColor]);

  const chartOptions = useMemo(
    () => ({
      indexAxis: horizontal ? ('y' as const) : ('x' as const),
      scales: {
        x: {
          type: horizontal ? ('linear' as const) : ('category' as const),
          min: horizontal ? 0 : undefined,
          beginAtZero: horizontal ? true : undefined,
          stacked,
          grid: {
            display: horizontal ? true : false,
            color: colors.chart.line,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            autoSkip: horizontal ? undefined : true,
            maxRotation: horizontal ? undefined : 0,
            callback: horizontal
              ? (tickValue: string | number) => renderNumberLabels(String(tickValue))
              : (tickValue: string | number) => chartData.labels?.[Number(tickValue)] || '',
          },
        },
        y: {
          type: horizontal ? ('category' as const) : ('linear' as const),
          min: horizontal ? undefined : 0,
          beginAtZero: horizontal ? undefined : true,
          stacked,
          grid: {
            display: horizontal ? false : true,
            color: colors.chart.line,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            callback: horizontal
              ? (tickValue: string | number) => chartData.labels?.[Number(tickValue)] || ''
              : (tickValue: string | number) => renderNumberLabels(String(tickValue)),
          },
        },
      },
    }),
    [chartData.labels, colors, horizontal, stacked],
  );

  const handleTooltip = useCallback(({ tooltip }: { tooltip: any }) => {
    const { opacity, labelColors, dataPoints } = tooltip;
    const point = dataPoints?.[0];
    const nextTooltip = opacity
      ? {
          title: (point?.label ?? '').toString(),
          color: labelColors?.[0]?.backgroundColor,
          value: `${formatLongNumber(
            Number(horizontal ? point?.raw?.x ?? point?.raw ?? 0 : point?.raw?.y ?? point?.raw ?? 0),
          )}${point?.dataset?.label ? ` ${point.dataset.label}` : ''}`,
        }
      : null;

    setTooltip(prev => {
      if (
        prev?.title === nextTooltip?.title &&
        prev?.color === nextTooltip?.color &&
        prev?.value === nextTooltip?.value
      ) {
        return prev;
      }

      return nextTooltip;
    });
  }, [horizontal]);

  return (
    <>
      <Chart
        type="bar"
        chartData={chartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
        height={height}
      />
      {tooltip && <ChartTooltip {...tooltip} />}
    </>
  );
}

export const DistributionBarChart = memo(DistributionBarChartComponent);

DistributionBarChart.displayName = 'DistributionBarChart';
