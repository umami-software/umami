import { Chart, ChartProps } from '@/components/charts/Chart';
import { useState } from 'react';
import { StatusLight } from 'react-basics';
import { formatLongNumber } from '@/lib/format';

export interface BubbleChartProps extends ChartProps {
  type?: 'bubble';
}

export default function BubbleChart(props: BubbleChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { type = 'bubble' } = props;

  const handleTooltip = ({ tooltip }) => {
    const { labelColors, dataPoints } = tooltip;

    setTooltip(
      tooltip.opacity ? (
        <StatusLight color={labelColors?.[0]?.backgroundColor}>
          {formatLongNumber(dataPoints?.[0]?.raw)} {dataPoints?.[0]?.label}
        </StatusLight>
      ) : null,
    );
  };

  return <Chart {...props} type={type} tooltip={tooltip} onTooltip={handleTooltip} />;
}
