import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@umami/react-zen';
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from 'recharts';
import { Chart, type ChartProps, getDatasetColor } from '@/components/charts/Chart';
import type { LegendItem } from '@/components/metrics/Legend';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';

export interface BubbleChartProps extends ChartProps {
  type?: 'bubble';
}

/** Plots each dataset's `{ x, y, r }` points as bubbles, sized by `r`. */
export function BubbleChart({
  type: _type,
  chartData,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  hiddenLabels: _hiddenLabels,
  onLegendClick: _onLegendClick,
  annotations: _annotations,
  ...props
}: BubbleChartProps) {
  const datasets = chartData?.datasets ?? [];
  const legendItems: LegendItem[] = datasets
    .filter(({ label }) => label)
    .map(dataset => ({ text: dataset.label, color: getDatasetColor(dataset) }));

  return (
    <Chart {...props} legendItems={legendItems}>
      <ChartContainer config={{}} style={{ width: '100%', height: '100%', aspectRatio: 'auto' }}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="number" dataKey="x" tickLine={false} axisLine={false} />
          <YAxis type="number" dataKey="y" tickLine={false} axisLine={false} width="auto" />
          <ZAxis type="number" dataKey="r" range={[16, 1600]} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          {datasets.map((dataset, index) => (
            <Scatter
              key={dataset.label || index}
              name={dataset.label}
              data={dataset.data as any[]}
              fill={getDatasetColor(dataset)}
              animationDuration={animationDuration}
            />
          ))}
        </ScatterChart>
      </ChartContainer>
    </Chart>
  );
}
