import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@umami/react-zen';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart as RechartsPieChart } from 'recharts';
import { Chart, type ChartProps, getPointValue } from '@/components/charts/Chart';
import { ChartTooltipRow } from '@/components/charts/ChartTooltip';
import type { LegendItem } from '@/components/metrics/Legend';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';

export interface PieChartProps extends ChartProps {
  type?: 'doughnut' | 'pie';
}

export function PieChart({
  type = 'pie',
  height = '300px',
  chartData,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  hiddenLabels: _hiddenLabels,
  onLegendClick: _onLegendClick,
  annotations: _annotations,
  ...props
}: PieChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());

  // One slice per label, colored by the first dataset's per-point colors.
  const slices = useMemo(() => {
    const dataset = chartData?.datasets?.[0];
    const colors = [dataset?.backgroundColor ?? []].flat();

    return (chartData?.labels ?? []).map((label, index) => ({
      label,
      value: getPointValue(dataset?.data?.[index]) ?? 0,
      fill: colors[index % (colors.length || 1)],
    }));
  }, [chartData]);

  const legendItems: LegendItem[] = slices.map(({ label, fill }) => ({
    text: label,
    color: fill,
    hidden: hidden.has(label),
  }));

  const handleLegendClick = ({ text }: LegendItem) => {
    setHidden(prev => {
      const next = new Set(prev);

      if (!next.delete(text)) {
        next.add(text);
      }

      return next;
    });
  };

  const visibleSlices = slices.filter(({ label }) => !hidden.has(label));

  return (
    <Chart
      {...props}
      height={height}
      legendItems={legendItems}
      onLegendItemClick={handleLegendClick}
    >
      <ChartContainer config={{}} style={{ width: '100%', height: '100%', aspectRatio: 'auto' }}>
        <RechartsPieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name, item) => (
                  <ChartTooltipRow
                    color={item.payload?.fill}
                    label={name}
                    value={Number(value ?? 0).toLocaleString()}
                  />
                )}
              />
            }
          />
          <Pie
            data={visibleSlices}
            dataKey="value"
            nameKey="label"
            innerRadius={type === 'doughnut' ? '50%' : 0}
            outerRadius="90%"
            strokeWidth={0}
            animationDuration={animationDuration}
          >
            {visibleSlices.map(({ label, fill }) => (
              <Cell key={label} fill={fill} />
            ))}
          </Pie>
        </RechartsPieChart>
      </ChartContainer>
    </Chart>
  );
}
