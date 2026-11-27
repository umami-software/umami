import { Box, type BoxProps, Column, Skeleton } from '@umami/react-zen';
import type { ReactNode } from 'react';
import type { ChartAnnotation } from '@/components/charts/ChartAnnotationMarkers';
import { Legend, type LegendItem } from '@/components/metrics/Legend';

export type ChartPoint = { x: string | number; y: number | null; d?: string; r?: number };

/** A data series. Bar and line charts plot `data` against the chart's time buckets or labels. */
export interface ChartDataset {
  label?: string;
  type?: 'bar' | 'line';
  data: (ChartPoint | number | null)[];
  /** A color, or one color per data point (pie charts). */
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
  /** Series with a lower order are drawn on top. */
  order?: number;
  /** Line charts: curve the line through the points. */
  tension?: number;
  /** Line charts: point radius. */
  pointRadius?: number;
  /** Line charts: fill the area under the line with a fading gradient. */
  fill?: boolean;
  [key: string]: any;
}

export interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
  /** Shows only the dataset with this label. */
  focusLabel?: string;
  [key: string]: any;
}

export interface ChartProps extends Omit<BoxProps, 'children'> {
  chartData?: ChartData;
  animationDuration?: number;
  /** Datasets to hide, for a legend whose state is kept by the parent (see `onLegendClick`). */
  hiddenLabels?: Set<string>;
  onLegendClick?: (label: string, willBeHidden: boolean) => void;
  legendActions?: ReactNode;
  annotations?: ChartAnnotation[];
  onAnnotationClick?: (annotations: ChartAnnotation[]) => void;
  onAnnotationMoreClick?: (annotations: ChartAnnotation[]) => void;
  /** Shows a placeholder in place of the plot, keeping the chart's size and legend. */
  loading?: boolean;
}

export interface ChartFrameProps extends Omit<BoxProps, 'children'> {
  legendItems?: LegendItem[];
  onLegendItemClick?: (item: LegendItem) => void;
  legendActions?: ReactNode;
  /** Drawn over the plot, such as annotation markers. Hidden while loading. */
  overlay?: ReactNode;
  /** Shows a placeholder in place of the plot, keeping the chart's size and legend. */
  loading?: boolean;
  children: ReactNode;
}

/** The value of a data point, which is either a number or an `{ x, y }` point. */
export function getPointValue(point: ChartPoint | number | null | undefined): number | null {
  if (point === null || point === undefined) {
    return null;
  }

  return typeof point === 'number' ? point : point.y;
}

/** A dataset's single color, for legends and tooltips. */
export function getDatasetColor(dataset: ChartDataset) {
  const background = Array.isArray(dataset.backgroundColor) ? undefined : dataset.backgroundColor;

  return background || dataset.borderColor;
}

/**
 * Lays out a chart with its legend below, and an overlay (such as annotation markers) over the
 * plot. The chart itself (a Zen ChartContainer) is passed as children.
 */
export function Chart({
  legendItems = [],
  onLegendItemClick,
  legendActions,
  overlay,
  loading,
  children,
  ...props
}: ChartFrameProps) {
  const legend = <Legend items={legendItems} onClick={onLegendItemClick} />;

  return (
    <Column gap="6">
      <Box {...props}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {loading ? (
            <Skeleton data-test="chart-skeleton" style={{ width: '100%', height: '100%' }} />
          ) : (
            children
          )}
          {!loading && overlay}
        </div>
      </Box>
      {legendActions ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{ gridColumn: 2 }}>{legend}</div>
          <div style={{ justifySelf: 'end' }}>{legendActions}</div>
        </div>
      ) : (
        legend
      )}
    </Column>
  );
}
