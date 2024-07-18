import { Chart, ChartProps } from 'components/charts/Chart';
import { useState } from 'react';
import { StatusLight } from 'react-basics';
import { formatLongNumber } from 'lib/format';

export interface PieChartProps extends ChartProps {
  type?: 'doughnut' | 'pie';
}

export default function PieChart(props: PieChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { type } = props;

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

  return <Chart {...props} type={type || 'pie'} tooltip={tooltip} onTooltip={handleTooltip} />;
}
