import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@umami/react-zen';
import { colord } from 'colord';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  DefaultZIndexes,
  Line,
  type MouseHandlerDataParam,
  usePlotArea,
  XAxis,
  YAxis,
  ZIndexLayer,
} from 'recharts';
import {
  Chart,
  type ChartDataset,
  type ChartProps,
  getDatasetColor,
  getPointValue,
} from '@/components/charts/Chart';
import type { AnnotationMarker } from '@/components/charts/ChartAnnotationMarkers';
import { ChartTooltipRow } from '@/components/charts/ChartTooltip';
import { useLocale } from '@/components/hooks';
import type { LegendItem } from '@/components/metrics/Legend';
import { getChartBucketIndex, renderDateLabels, renderNumberLabels } from '@/lib/charts';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';
import { DATE_FUNCTIONS, formatDate } from '@/lib/date';
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

const MAIN_AXIS = 'main';

type LabelRenderer = (label: string, index: number, values: { value: number }[]) => string;

export interface BarChartProps extends ChartProps {
  unit?: string;
  stacked?: boolean;
  currency?: string;
  /** Formats a bar's value in the tooltip, for values that are not plain counts. */
  formatValue?: (value: number) => string;
  /** Formats an x-axis label. `values[index].value` is the bucket's timestamp. */
  renderXLabel?: LabelRenderer;
  /** Formats a y-axis label. `label` is the tick value. */
  renderYLabel?: LabelRenderer;
  minDate?: Date;
  maxDate?: Date;
  /** Called with the start of the clicked bar's time bucket. */
  onBarClick?: (date: Date) => void;
}

interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Series {
  key: string;
  index: number;
  dataset: ChartDataset;
  hidden: boolean;
}

interface BandCursorProps {
  /** Number of buckets on the x axis. */
  count: number;
  // Passed in by Recharts when it renders the cursor.
  points?: { x: number; y: number }[];
  top?: number;
  width?: number;
  height?: number;
}

/**
 * Highlights the hovered bucket with a band the width of the bucket. Recharts only draws a band
 * for BarChart; ComposedChart gets a line, drawn above the bars. The band goes in the cursor
 * rectangle layer, which is below the bars.
 */
function BandCursor({ count, points, top, width, height }: BandCursorProps) {
  const x = points?.[0]?.x;

  if (x === undefined || !count || !width) {
    return null;
  }

  const bandWidth = width / count;

  return (
    <ZIndexLayer zIndex={DefaultZIndexes.cursorRectangle}>
      <rect
        x={x - bandWidth / 2}
        y={top}
        width={bandWidth}
        height={height}
        fill="var(--foreground)"
        fillOpacity={0.05}
        pointerEvents="none"
      />
    </ZIndexLayer>
  );
}

/** Reports the plot area's position, so annotation markers can be placed over the buckets. */
function PlotAreaReporter({ onChange }: { onChange: (area: PlotArea) => void }) {
  const area = usePlotArea();

  useEffect(() => {
    if (area) {
      onChange({ x: area.x, y: area.y, width: area.width, height: area.height });
    }
  }, [area?.x, area?.y, area?.width, area?.height]);

  return null;
}

function BarChartComponent({
  chartData,
  renderXLabel,
  renderYLabel,
  unit,
  stacked = false,
  minDate,
  maxDate: _maxDate,
  currency,
  formatValue,
  onBarClick,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  hiddenLabels,
  onLegendClick,
  legendActions,
  annotations,
  onAnnotationClick,
  onAnnotationMoreClick,
  ...props
}: BarChartProps) {
  const { locale } = useLocale();
  const [legendHidden, setLegendHidden] = useState<Set<string>>(() => new Set());
  const [plotArea, setPlotArea] = useState<PlotArea | null>(null);
  // Touch has no hover, so the first tap on a bar shows its tooltip and a second tap drills in.
  const tappedTimeRef = useRef<number | null>(null);
  const datasets = chartData?.datasets ?? [];
  const focusLabel = chartData?.focusLabel;

  // One row per time bucket, with each dataset's value under its series key.
  const rows = useMemo(() => {
    const length = Math.max(0, ...datasets.map(({ data }) => data?.length ?? 0));
    const { add, start } = (unit && DATE_FUNCTIONS[unit]) || {};

    return Array.from({ length }, (_, index) => {
      const point = datasets[0]?.data?.[index];
      const ts =
        minDate && add
          ? add(start(minDate), index).getTime()
          : new Date((point as any)?.x ?? index).getTime();
      const row: Record<string, number | null> = { ts, index };

      datasets.forEach(({ data }, k) => {
        row[`s${k}`] = getPointValue(data?.[index]);
      });

      return row;
    });
  }, [datasets, unit, minDate]);

  const series: Series[] = useMemo(
    () =>
      datasets
        .map((dataset, index) => {
          const label = dataset.label ?? '';
          const hidden =
            !!hiddenLabels?.has(label) ||
            (focusLabel ? label !== focusLabel : false) ||
            legendHidden.has(label);

          return { key: `s${index}`, index, dataset, hidden };
        })
        // Lower order is drawn on top, so it renders last.
        .sort((a, b) => (b.dataset.order ?? 0) - (a.dataset.order ?? 0)),
    [datasets, hiddenLabels, focusLabel, legendHidden],
  );

  const config: ChartConfig = useMemo(
    () =>
      Object.fromEntries(
        series.map(({ key, dataset }) => [
          key,
          { label: dataset.label, color: getDatasetColor(dataset) },
        ]),
      ),
    [series],
  );

  const bars = series.filter(({ dataset }) => dataset.type !== 'line');
  // Unstacked bars overlap in each bucket (e.g. visitors in front of views), so each one gets
  // its own hidden x axis and is drawn the full width of the bucket.
  const overlapBars = !stacked && bars.length > 1;

  const legendItems: LegendItem[] = datasets
    .filter(({ label }) => label)
    .map(dataset => ({
      text: dataset.label,
      color: getDatasetColor(dataset),
      hidden: series.find(s => s.dataset === dataset)?.hidden,
    }));

  const handleLegendClick = ({ text }: LegendItem) => {
    if (onLegendClick) {
      onLegendClick(text, !hiddenLabels?.has(text));
      return;
    }

    setLegendHidden(prev => {
      const next = new Set(prev);

      if (!next.delete(text)) {
        next.add(text);
      }

      return next;
    });
  };

  const handleClick = useCallback(
    (state: MouseHandlerDataParam, event: any) => {
      // Null when the click misses every bucket (Number(null) would be bucket 0).
      const activeIndex = state?.activeTooltipIndex;
      const index = activeIndex === null || activeIndex === undefined ? NaN : Number(activeIndex);

      if (!onBarClick || !minDate || !unit || !Number.isInteger(index) || index < 0) {
        tappedTimeRef.current = null;
        return;
      }

      // Buckets are generated from minDate, so the index gives the bar's date.
      const { add, start } = DATE_FUNCTIONS[unit];
      const date = add(start(minDate), index);

      if (isTouch(event?.nativeEvent) && tappedTimeRef.current !== date.getTime()) {
        tappedTimeRef.current = date.getTime();
        return;
      }

      tappedTimeRef.current = null;
      onBarClick(date);
    },
    [onBarClick, minDate, unit],
  );

  const markers = useMemo(() => {
    if (!annotations?.length || !plotArea || !rows.length) {
      return [];
    }

    const timestamps = rows.map(({ ts }) => ts);
    const groups = new Map<number, AnnotationMarker>();

    for (const annotation of annotations) {
      const index = getChartBucketIndex(timestamps, annotation.markerDate || annotation.date);

      if (index < 0) {
        continue;
      }

      const x = Math.round(plotArea.x + (plotArea.width * (index + 0.5)) / rows.length);
      const group = groups.get(x);

      if (group) {
        group.annotations.push(annotation);
      } else {
        groups.set(x, { annotations: [annotation], x, y: plotArea.y + plotArea.height });
      }
    }

    return [...groups.values()];
  }, [annotations, plotArea, rows]);

  const xLabel = useMemo(
    () => renderXLabel ?? renderDateLabels(unit, locale),
    [renderXLabel, unit, locale],
  );

  const formatTooltipValue = (value: number) =>
    currency ? formatLongCurrency(value, currency) : (formatValue ?? formatLongNumber)(value);

  return (
    <Chart
      {...props}
      legendItems={legendItems}
      onLegendItemClick={handleLegendClick}
      legendActions={legendActions}
      markers={markers}
      onAnnotationClick={onAnnotationClick}
      onAnnotationMoreClick={onAnnotationMoreClick}
    >
      <ChartContainer
        config={config}
        style={{ width: '100%', height: '100%', aspectRatio: 'auto' }}
      >
        <ComposedChart
          data={rows}
          barCategoryGap="10%"
          onClick={onBarClick ? handleClick : undefined}
          style={onBarClick ? { cursor: 'pointer' } : undefined}
        >
          <defs>
            {series
              .filter(({ dataset }) => dataset.type === 'line' && dataset.fill)
              .map(({ key, dataset }) => {
                const color = colord(dataset.borderColor || getDatasetColor(dataset)).alpha(1);

                return (
                  <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.toRgbString()} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={color.toRgbString()} stopOpacity={0.02} />
                  </linearGradient>
                );
              })}
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            xAxisId={MAIN_AXIS}
            dataKey="ts"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={16}
            interval="preserveStartEnd"
            tickFormatter={(ts: number) => xLabel(String(ts), 0, [{ value: ts }])}
          />
          {overlapBars &&
            bars.map(({ key }) => <XAxis key={key} xAxisId={key} dataKey="ts" hide />)}
          <YAxis
            tickLine={false}
            axisLine={false}
            width="auto"
            domain={[0, 'auto']}
            tickFormatter={(value: number) =>
              String((renderYLabel ?? renderNumberLabels)(String(value), 0, []))
            }
          />
          <ChartTooltip
            cursor={<BandCursor count={rows.length} />}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const ts = payload?.[0]?.payload?.ts;

                  return ts ? formatDate(new Date(ts), dateFormats[unit], locale) : null;
                }}
                formatter={(value, name, item) => (
                  <ChartTooltipRow
                    color={item.color}
                    label={config[item.dataKey as string]?.label ?? name}
                    value={formatTooltipValue(Number(value ?? 0))}
                  />
                )}
              />
            }
          />
          {series.map(({ key, dataset, hidden }) => {
            const name = dataset.label || key;
            const color = getDatasetColor(dataset);

            if (dataset.type === 'line') {
              const lineProps = {
                xAxisId: MAIN_AXIS,
                dataKey: key,
                name,
                hide: hidden,
                type: dataset.tension ? ('monotone' as const) : ('linear' as const),
                stroke: dataset.borderColor || color,
                strokeWidth: dataset.borderWidth ?? 2,
                dot: dataset.pointRadius
                  ? { r: dataset.pointRadius, strokeWidth: 0, fill: dataset.borderColor || color }
                  : false,
                activeDot: { r: (dataset.pointRadius ?? 2) + 2 },
                animationDuration,
              };

              return dataset.fill ? (
                <Area key={key} {...lineProps} fill={`url(#fill-${key})`} />
              ) : (
                <Line key={key} {...lineProps} />
              );
            }

            const fill = color;
            const stroke = dataset.borderColor || color;

            return (
              <Bar
                key={key}
                xAxisId={overlapBars ? key : MAIN_AXIS}
                dataKey={key}
                name={name}
                hide={hidden}
                stackId={stacked ? 'stack' : undefined}
                fill={fill}
                stroke={stroke}
                strokeWidth={dataset.borderWidth ?? 0}
                activeBar={{
                  fill: dataset.hoverBackgroundColor || fill,
                  stroke: dataset.hoverBorderColor || stroke,
                }}
                animationDuration={animationDuration}
              />
            );
          })}
          {annotations?.length ? <PlotAreaReporter onChange={setPlotArea} /> : null}
        </ComposedChart>
      </ChartContainer>
    </Chart>
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
