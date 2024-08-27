import BarChartTooltip from 'components/charts/BarChartTooltip';
import Chart, { ChartProps } from 'components/charts/Chart';
import { useTheme } from 'components/hooks';
import { renderNumberLabels } from 'lib/charts';
import { useMemo, useState } from 'react';

export interface BarChartProps extends ChartProps {
  unit: string;
  stacked?: boolean;
  renderXLabel?: (label: string, index: number, values: any[]) => string;
  renderYLabel?: (label: string, index: number, values: any[]) => string;
  XAxisType?: string;
  YAxisType?: string;
  minDate?: number | string;
  maxDate?: number | string;
}

export function BarChart(props: BarChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { colors } = useTheme();
  const {
    renderXLabel,
    renderYLabel,
    unit,
    XAxisType = 'time',
    YAxisType = 'linear',
    stacked = false,
    minDate,
    maxDate,
  } = props;

  const options: any = useMemo(() => {
    return {
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
          min: minDate && new Date(minDate).getSeconds() === 0 ? minDate : '',
          max: maxDate,
          time: {
            unit,
          },
          grid: {
            display: false,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            autoSkip: false,
            maxRotation: 0,
            callback: renderXLabel,
          },
        },
        y: {
          type: YAxisType,
          min: 0,
          beginAtZero: true,
          stacked,
          grid: {
            color: colors.chart.line,
          },
          border: {
            color: colors.chart.line,
          },
          ticks: {
            color: colors.chart.text,
            callback: renderYLabel || renderNumberLabels,
          },
        },
      },
    };
  }, [colors, unit, stacked, renderXLabel, renderYLabel]);

  const handleTooltip = ({ tooltip }: { tooltip: any }) => {
    const { opacity } = tooltip;

    setTooltip(opacity ? <BarChartTooltip tooltip={tooltip} unit={unit} /> : null);
  };

  return (
    <Chart
      {...props}
      type="bar"
      chartOptions={options}
      tooltip={tooltip}
      onTooltip={handleTooltip}
    />
  );
}

export default BarChart;
