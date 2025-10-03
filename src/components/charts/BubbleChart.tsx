import { Chart, ChartProps } from '@/components/charts/Chart';
import { useState } from 'react';
import { ChartTooltip } from '@/components/charts/ChartTooltip';

export interface BubbleChartProps extends ChartProps {
  type?: 'bubble';
}

export function BubbleChart({ type = 'bubble', ...props }: BubbleChartProps) {
  const [tooltip, setTooltip] = useState(null);

  const handleTooltip = ({ tooltip }) => {
    const { opacity, labelColors, title, dataPoints } = tooltip;

    setTooltip(
      opacity
        ? {
            color: labelColors?.[0]?.backgroundColor,
            value: `${title}: ${dataPoints[0].raw}`,
          }
        : null,
    );
  };

  return (
    <>
      <Chart {...props} type={type} onTooltip={handleTooltip} />
      {tooltip && <ChartTooltip {...tooltip} />}
    </>
  );
}
