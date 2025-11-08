import { Chart, ChartProps } from '@/components/charts/Chart';
import { useState } from 'react';
import { ChartTooltip } from '@/components/charts/ChartTooltip';

export interface PieChartProps extends ChartProps {
  type?: 'doughnut' | 'pie';
}

export function PieChart({ type = 'pie', ...props }: PieChartProps) {
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
