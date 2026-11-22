import { useTheme } from '@umami/react-zen';
import ChartJS from 'chart.js/auto';
import {
  memo,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const touchInput = useRef(false);
  const touch = useRef<{ chart: ChartJS; x: number; y: number } | null>(null);
  const selectedTouchBar = useRef<{ index: number; datasetIndex: number } | null>(null);
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { colors } = useMemo(() => getThemeColors(theme), [theme]);
  // Read through a ref so a new callback doesn't rebuild the chart options.
  const onBarClickRef = useRef(onBarClick);
  onBarClickRef.current = onBarClick;
  const isClickable = !!onBarClick;

  const dismissTouch = useCallback((chart = touch.current?.chart) => {
    selectedTouchBar.current = null;
    touch.current = null;
    setTouchPosition(null);
    setTooltip(null);
    chart?.tooltip?.setActiveElements([], { x: 0, y: 0 });
  }, []);

  const startTime = minDate?.getTime();
  const endTime = maxDate?.getTime();

  useLayoutEffect(() => {
    if (touch.current) {
      dismissTouch();
    }
  }, [chartData, startTime, endTime, unit, isClickable, dismissTouch]);

  useEffect(() => {
    if (!touchPosition) return;

    const dismissOutside = (event: Event) => {
      if (touch.current && event.target !== touch.current.chart.canvas) {
        dismissTouch();
      }
    };

    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('touchstart', dismissOutside, true);
    document.addEventListener('scroll', dismissOutside, true);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('touchstart', dismissOutside, true);
      document.removeEventListener('scroll', dismissOutside, true);
    };
  }, [touchPosition, dismissTouch]);

  const restorePointerInput = (event: PointerEvent<HTMLElement>) => {
    // A touch can generate mouse events, but its Pointer Events still identify it as touch.
    if (!touchInput.current || event.pointerType === 'touch') return;

    if (!touch.current && event.target instanceof HTMLCanvasElement) {
      const chart = ChartJS.getChart(event.target);
      chart?.tooltip?.setActiveElements([], { x: 0, y: 0 });
    }

    touchInput.current = false;
    touch.current = null;
    selectedTouchBar.current = null;
    setTouchPosition(null);
  };

  const chartOptions: any = useMemo(() => {
    const min = formatDate(minDate, DATE_FORMATS[unit], locale);
    const max = formatDate(maxDate, DATE_FORMATS[unit], locale);

    return {
      __id: Date.now(),
      ...(isClickable && {
        onClick: (
          event: { native?: { target?: HTMLElement } },
          elements: { index: number; datasetIndex: number }[],
        ) => {
          if (!elements.length) {
            if (touch.current) dismissTouch();
            return;
          }
          if (touchInput.current) {
            if (!touch.current) return;

            const selected = selectedTouchBar.current;
            const { index, datasetIndex } = elements[0];
            if (!selected || selected.index !== index || selected.datasetIndex !== datasetIndex) {
              selectedTouchBar.current = { index, datasetIndex };
              return;
            }
            dismissTouch();
          }
          // The canvas is reused, and the next view may not be clickable.
          if (event.native?.target) {
            event.native.target.style.cursor = 'default';
          }
          // Buckets are generated from minDate, so the index gives the bar's date.
          const { add, start } = DATE_FUNCTIONS[unit];
          onBarClickRef.current?.(add(start(minDate), elements[0].index));
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
    dismissTouch,
  ]);

  const handleTooltip = useCallback(
    ({ tooltip }: { tooltip: any }) => {
      // Chart.js can still process compatibility events after a touch was dismissed.
      if (touchInput.current && !touch.current) return;

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
        onPointerDownCapture={event => {
          props.onPointerDownCapture?.(event);
          restorePointerInput(event);
        }}
        onPointerMoveCapture={event => {
          props.onPointerMoveCapture?.(event);
          restorePointerInput(event);
        }}
        onTouchStartCapture={event => {
          props.onTouchStartCapture?.(event);
          touchInput.current = true;
          const pointer = event.touches[0];
          const chart =
            event.target instanceof HTMLCanvasElement ? ChartJS.getChart(event.target) : undefined;
          // Chart.js does not call onClick for canvas points outside the plotting area.
          if (
            !chart ||
            event.touches.length !== 1 ||
            !chart.getElementsAtEventForMode(
              event.nativeEvent,
              'nearest',
              { intersect: true },
              false,
            ).length
          ) {
            dismissTouch(chart);
            return;
          }

          touch.current = { chart, x: pointer.clientX, y: pointer.clientY };
          setTouchPosition({ x: pointer.clientX, y: pointer.clientY });
          // Let the next native event publish the tooltip even if Chart.js kept the same active bar.
          chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
        }}
        onTouchMoveCapture={event => {
          props.onTouchMoveCapture?.(event);
          const start = touch.current;
          const pointer = event.touches[0];
          if (
            start &&
            pointer &&
            Math.hypot(pointer.clientX - start.x, pointer.clientY - start.y) > 10
          ) {
            dismissTouch();
          }
        }}
        onTouchCancelCapture={event => {
          props.onTouchCancelCapture?.(event);
          dismissTouch();
        }}
        type="bar"
        chartData={chartData}
        chartOptions={chartOptions}
        onTooltip={handleTooltip}
      />
      {tooltip && <ChartTooltip {...tooltip} touchPosition={touchPosition} />}
    </>
  );
}

export const BarChart = memo(BarChartComponent);

BarChart.displayName = 'BarChart';
