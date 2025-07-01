import { useMemo, useState } from 'react';
import { useTheme } from '@umami/react-zen';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { Chart, ChartProps } from '@/components/charts/Chart';
import { useLocale } from '@/components/hooks';
import { renderNumberLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { formatDate, DATE_FORMATS } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

const dateFormats = {
  millisecond: 'T',
  second: 'pp',
  minute: 'p',
  hour: 'p - PP',
  day: 'PPPP',
  week: 'PPPP',
  month: 'LLLL yyyy',
  quarter: 'qqq',
  year: 'yyyy',
};

export interface BarChartProps extends ChartProps {
  unit?: string;
  stacked?: boolean;
  currency?: string;
  renderXLabel?: (label: string, index: number, values: any[]) => string;
  renderYLabel?: (label: string, index: number, values: any[]) => string;
  XAxisType?: string;
  YAxisType?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function BarChart({
  chartData,
  renderXLabel,
  renderYLabel,
  unit,
  XAxisType = 'timeseries',
  YAxisType = 'linear',
  stacked = false,
  minDate,
  maxDate,
  currency,
  ...props
}: BarChartProps) {
  const [tooltip, setTooltip] = useState(null);
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);

  const chartOptions: any = useMemo(() => {
    return {
      __id: new Date().getTime(),
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
          min: formatDate(minDate, DATE_FORMATS[unit], locale),
          max: formatDate(maxDate, DATE_FORMATS[unit], locale),
          offset: true,
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
          stacked: !!stacked,
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
  }, [chartData, colors, unit, stacked, renderXLabel, renderYLabel]);

  const handleTooltip = ({ tooltip }: { tooltip: any }) => {
    const { opacity, labelColors, dataPoints } = tooltip;

    setTooltip(
      opacity
        ? {
            title: formatDate(
              new Date(dataPoints[0].raw?.d || dataPoints[0].raw?.x || dataPoints[0].raw),
              dateFormats[unit],
              locale,
            ),
            color: labelColors?.[0]?.backgroundColor,
            value: currency
              ? formatLongCurrency(dataPoints[0].raw.y, currency)
              : `${formatLongNumber(dataPoints[0].raw.y)} ${dataPoints[0].dataset.label}`,
          }
        : null,
    );
  };

  return (
    <>
      <Chart
        {...props}
        type="bar"
        chartData={chartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
      />
      {tooltip && <ChartTooltip {...tooltip} />}
    </>
  );
}
