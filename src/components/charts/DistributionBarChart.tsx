'use client';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@umami/react-zen';
import { memo, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Chart } from '@/components/charts/Chart';
import { ChartTooltipRow } from '@/components/charts/ChartTooltip';
import type { LegendItem } from '@/components/metrics/Legend';
import { renderNumberLabels } from '@/lib/charts';
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
  // Either several datasets over shared labels, or a single series of label counts.
  const series: DistributionDataset[] = useMemo(
    () =>
      datasets?.length && labels?.length
        ? datasets
        : [
            {
              label: '',
              values: (data || []).map(item => item.count),
              backgroundColor,
              borderColor,
            },
          ],
    [data, datasets, labels, backgroundColor, borderColor],
  );

  const rowLabels = datasets?.length && labels?.length ? labels : (data || []).map(d => d.label);

  const rows = useMemo(
    () =>
      rowLabels.map((label, index) => ({
        label,
        ...Object.fromEntries(series.map(({ values }, k) => [`s${k}`, values[index] ?? 0])),
      })),
    [rowLabels, series],
  );

  const config: ChartConfig = Object.fromEntries(
    series.map(({ label, backgroundColor }, k) => [`s${k}`, { label, color: backgroundColor }]),
  );

  const legendItems: LegendItem[] = series
    .filter(({ label }) => label)
    .map(({ label, backgroundColor }) => ({ text: label, color: backgroundColor }));

  const numberAxis = {
    type: 'number' as const,
    tickLine: false,
    axisLine: false,
    tickFormatter: (value: number) => String(renderNumberLabels(String(value))),
  };
  const categoryAxis = {
    type: 'category' as const,
    dataKey: 'label',
    tickLine: false,
    axisLine: false,
  };

  return (
    <Chart height={height} legendItems={legendItems}>
      <ChartContainer
        config={config}
        style={{ width: '100%', height: '100%', aspectRatio: 'auto' }}
      >
        <BarChart data={rows} layout={horizontal ? 'vertical' : 'horizontal'}>
          <CartesianGrid horizontal={!horizontal} vertical={horizontal} />
          {horizontal ? (
            <>
              <XAxis {...numberAxis} />
              <YAxis {...categoryAxis} width="auto" />
            </>
          ) : (
            <>
              <XAxis {...categoryAxis} minTickGap={8} />
              <YAxis {...numberAxis} width="auto" />
            </>
          )}
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
                formatter={(value, name, item) => (
                  <ChartTooltipRow
                    color={item.color}
                    label={config[item.dataKey as string]?.label || name}
                    value={formatLongNumber(Number(value ?? 0))}
                  />
                )}
              />
            }
          />
          {series.map(({ label, backgroundColor, borderColor }, k) => (
            <Bar
              key={`s${k}`}
              dataKey={`s${k}`}
              name={label || `s${k}`}
              stackId={stacked ? 'stack' : undefined}
              fill={backgroundColor}
              stroke={borderColor || backgroundColor}
              strokeWidth={1}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </Chart>
  );
}

export const DistributionBarChart = memo(DistributionBarChartComponent);

DistributionBarChart.displayName = 'DistributionBarChart';
