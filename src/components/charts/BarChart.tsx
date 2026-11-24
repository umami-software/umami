import { useTheme } from '@umami/react-zen';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Chart, type ChartProps } from '@/components/charts/Chart';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { useLocale } from '@/components/hooks';
import { renderNumberLabels } from '@/lib/charts';
import { getThemeColors } from '@/lib/colors';
import { DATE_FORMATS, DATE_FUNCTIONS, formatDate, parseBackendDate } from '@/lib/date';
import { formatLongCurrency, formatLongNumber } from '@/lib/format';

const MemoChart = memo(Chart);

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
  /** Formats a bar's value in the tooltip, for values that are not plain counts. */
  formatValue?: (value: number) => string;
  renderXLabel?: (label: string, index: number, values: any[]) => string;
  renderYLabel?: (label: string, index: number, values: any[]) => string;
  XAxisType?: string;
  YAxisType?: string;
  minDate?: Date;
  maxDate?: Date;
  /**
   * For data that comes in whole periods, such as daily ad or search data. A range within one
   * period gives the axis no width, so Chart.js adds ticks a millisecond either side of it,
   * labelled with the neighbouring dates. Only the period's own tick is labelled instead.
   */
  fitSinglePeriod?: boolean;
  /** Called with the start of the clicked bar's time bucket. */
  onBarClick?: (date: Date) => void;
}

interface TooltipState {
  title: string;
  color?: string;
  value: string;
}

function BarChartComponent({
  chartData,
  renderXLabel,
  renderYLabel,
  unit,
  XAxisType = 'timeseries',
  YAxisType = 'linear',
  stacked = false,
  minDate,
  maxDate,
  fitSinglePeriod,
  currency,
  formatValue,
  onBarClick,
  ...props
}: BarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  // Read through a ref so a new callback doesn't rebuild the chart options.
  const onBarClickRef = useRef(onBarClick);
  onBarClickRef.current = onBarClick;
  const isClickable = !!onBarClick;
  // Touch has no hover, so the first tap on a bar shows its tooltip and a second tap drills in.
  const tappedTimeRef = useRef<number | null>(null);

  const chartOptions: any = useMemo(() => {
    const min = formatDate(minDate, DATE_FORMATS[unit], locale);
    const max = formatDate(maxDate, DATE_FORMATS[unit], locale);

    return {
      __id: Date.now(),
      ...(isClickable && {
        onClick: (
          event: { native?: { target?: HTMLElement; pointerType?: string } },
          elements: { index: number }[],
        ) => {
          if (!elements.length) {
            tappedTimeRef.current = null;
            return;
          }

          // Buckets are generated from minDate, so the index gives the bar's date.
          const { add, start } = DATE_FUNCTIONS[unit];
          const date = add(start(minDate), elements[0].index);

          if (isTouch(event.native) && tappedTimeRef.current !== date.getTime()) {
            tappedTimeRef.current = date.getTime();
            return;
          }

          tappedTimeRef.current = null;
          // The canvas is reused, and the next view may not be clickable.
          if (event.native?.target) {
            event.native.target.style.cursor = 'default';
          }
          onBarClickRef.current?.(date);
        },
        onHover: (event: { native?: { target?: HTMLElement } }, elements: unknown[]) => {
          if (event.native?.target) {
            event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
          }
        },
      }),
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
          min,
          max,
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
            callback:
              fitSinglePeriod && min === max && renderXLabel
                ? (label: string, index: number, values: any[]) =>
                    DATE_FUNCTIONS[unit].start(values[index].value).getTime() ===
                    values[index].value
                      ? renderXLabel(label, index, values)
                      : ''
                : renderXLabel,
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
  }, [
    colors,
    unit,
    stacked,
    renderXLabel,
    renderYLabel,
    minDate,
    maxDate,
    fitSinglePeriod,
    locale,
    XAxisType,
    YAxisType,
    isClickable,
  ]);

  const handleTooltip = useCallback(
    ({ tooltip }: { tooltip: any }) => {
      const { opacity, labelColors, dataPoints } = tooltip;
      const nextTooltip = opacity
        ? {
            title: formatDate(
              parseBackendDate(dataPoints[0].raw?.d || dataPoints[0].raw?.x || dataPoints[0].raw),
              dateFormats[unit],
              locale,
            ),
            color: labelColors?.[0]?.borderColor || labelColors?.[0]?.backgroundColor,
            value: currency
              ? formatLongCurrency(dataPoints[0].raw.y, currency)
              : `${(formatValue ?? formatLongNumber)(dataPoints[0].raw.y)} ${dataPoints[0].dataset.label}`,
          }
        : null;

      setTooltip(prev => {
        if (
          prev?.title === nextTooltip?.title &&
          prev?.color === nextTooltip?.color &&
          prev?.value === nextTooltip?.value
        ) {
          return prev;
        }

        return nextTooltip;
      });
    },
    [currency, formatValue, locale, unit],
  );

  return (
    <>
      <MemoChart
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

// Click events are PointerEvents in current browsers. Older ones only say whether the device
// can hover.
function isTouch(event?: { pointerType?: string }) {
  if (event?.pointerType) {
    return event.pointerType === 'touch';
  }

  return typeof window !== 'undefined' && window.matchMedia?.('(hover: none)').matches;
}

export const BarChart = memo(BarChartComponent);

BarChart.displayName = 'BarChart';
