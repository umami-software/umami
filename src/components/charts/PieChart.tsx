import { Chart, ChartProps } from 'components/charts/Chart';
import { useState } from 'react';
import { StatusLight } from 'react-basics';
import { formatLongNumberOptions } from 'lib/format';
import { useIntl } from 'react-intl';

export interface PieChartProps extends ChartProps {
  type?: 'doughnut' | 'pie';
}

export default function PieChart(props: PieChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { type = 'pie' } = props;
  const intl = useIntl();

  const handleTooltip = ({ tooltip }) => {
    const { labelColors, dataPoints } = tooltip;

    setTooltip(
      tooltip.opacity ? (
        <StatusLight color={labelColors?.[0]?.backgroundColor}>
          {intl.formatNumber(dataPoints?.[0]?.raw, formatLongNumberOptions(dataPoints?.[0]?.raw))}{' '}
          {dataPoints?.[0]?.label}
        </StatusLight>
      ) : null,
    );
  };

  return <Chart {...props} type={type} tooltip={tooltip} onTooltip={handleTooltip} />;
}
