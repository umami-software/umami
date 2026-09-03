import { Box, type BoxProps, Column } from '@umami/react-zen';
import ChartJS, {
  type ChartData,
  type ChartOptions,
  type LegendItem,
  type UpdateMode,
} from 'chart.js/auto';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  type AnnotationMarker,
  type ChartAnnotation,
  ChartAnnotationMarkers,
} from '@/components/charts/ChartAnnotationMarkers';
import { Legend } from '@/components/metrics/Legend';
import { getChartBucketIndex } from '@/lib/charts';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';

ChartJS.defaults.font.family = 'Inter';

export interface ChartProps extends BoxProps {
  type?: 'bar' | 'bubble' | 'doughnut' | 'pie' | 'line' | 'polarArea' | 'radar' | 'scatter';
  chartData?: ChartData<any, any, unknown> & { focusLabel?: string };
  chartOptions?: ChartOptions;
  updateMode?: UpdateMode;
  animationDuration?: number;
  onTooltip?: (model: any) => void;
  hiddenLabels?: Set<string>;
  onLegendClick?: (label: string, willBeHidden: boolean) => void;
  annotations?: ChartAnnotation[];
  onAnnotationClick?: (annotations: ChartAnnotation[]) => void;
  onAnnotationMoreClick?: (annotations: ChartAnnotation[]) => void;
}

function isSameMarkers(a: AnnotationMarker[], b: AnnotationMarker[]) {
  return (
    a.length === b.length &&
    a.every(
      (m, i) =>
        m.x === b[i].x &&
        m.y === b[i].y &&
        m.annotations.length === b[i].annotations.length &&
        m.annotations.every((annotation, j) => annotation === b[i].annotations[j]),
    )
  );
}

export function Chart({
  type,
  chartData,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  updateMode,
  onTooltip,
  chartOptions,
  hiddenLabels,
  onLegendClick,
  annotations,
  onAnnotationClick,
  onAnnotationMoreClick,
  ...props
}: ChartProps) {
  const canvas = useRef(null);
  const chart = useRef(null);
  const [legendItems, setLegendItems] = useState([]);
  const [markers, setMarkers] = useState<AnnotationMarker[]>([]);
  const annotationsRef = useRef<ChartAnnotation[]>(annotations);
  annotationsRef.current = annotations;

  // Computes pixel positions for annotation markers whenever the chart lays out (update / resize)
  const annotationPlugin = useMemo(
    () => ({
      id: 'annotationMarkers',
      afterLayout: (instance: any) => {
        const list = annotationsRef.current;
        const { chartArea, scales } = instance;

        if (!list?.length || !chartArea || !scales?.x) {
          setMarkers(prev => (prev.length ? [] : prev));
          return;
        }

        // Group annotations that land on the same pixel column into a single marker
        const groups = new Map<number, AnnotationMarker>();

        for (const annotation of list) {
          const markerDate = annotation.markerDate || annotation.date;
          const bucketIndex = getChartBucketIndex(
            instance.data.datasets[0]?.data || [],
            markerDate,
          );
          const bucket = instance.getDatasetMeta(0)?.data[bucketIndex];
          const x = Math.round(bucket?.x ?? scales.x.getPixelForValue(markerDate.getTime()));

          if (!Number.isFinite(x) || x < chartArea.left || x > chartArea.right) {
            continue;
          }

          const group = groups.get(x);

          if (group) {
            group.annotations.push(annotation);
          } else {
            groups.set(x, { annotations: [annotation], x, y: chartArea.bottom });
          }
        }

        const next = [...groups.values()];

        setMarkers(prev => (isSameMarkers(prev, next) ? prev : next));
      },
    }),
    [],
  );

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: animationDuration,
        resize: {
          duration: 0,
        },
        active: {
          duration: 0,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
          intersect: true,
          external: onTooltip,
        },
      },
      ...chartOptions,
    };
  }, [chartOptions]);

  const handleLegendClick = (item: LegendItem) => {
    if (onLegendClick && type === 'bar') {
      const { datasetIndex } = item;
      const ds = chart.current.data.datasets[datasetIndex];
      onLegendClick(ds.label, !hiddenLabels?.has(ds.label));
      return;
    }

    if (type === 'bar') {
      const { datasetIndex } = item;
      const meta = chart.current.getDatasetMeta(datasetIndex);

      meta.hidden =
        meta.hidden === null ? !chart.current.data.datasets[datasetIndex]?.hidden : null;
    } else {
      const { index } = item;
      const meta = chart.current.getDatasetMeta(0);
      const hidden = !!meta?.data?.[index]?.hidden;

      meta.data[index].hidden = !hidden;
      chart.current.legend.legendItems[index].hidden = !hidden;
    }

    chart.current.update(updateMode);

    setLegendItems(chart.current.legend.legendItems);
  };

  // Create chart
  useEffect(() => {
    if (canvas.current) {
      chart.current = new ChartJS(canvas.current, {
        type,
        data: chartData,
        options,
        plugins: [annotationPlugin],
      });

      setLegendItems(chart.current.legend.legendItems);
    }

    return () => {
      chart.current?.destroy();
    };
  }, []);

  // Update chart
  useEffect(() => {
    if (chart.current && chartData) {
      // Replace labels and datasets *in-place*
      chart.current.data.labels = chartData.labels;
      chart.current.data.datasets = chartData.datasets;

      if (chartData.focusLabel !== null) {
        chart.current.data.datasets.forEach((ds: { hidden: boolean; label: any }) => {
          ds.hidden = chartData.focusLabel ? ds.label !== chartData.focusLabel : false;
        });
      }

      if (hiddenLabels) {
        chart.current.data.datasets.forEach((ds: { hidden: boolean; label: any }) => {
          if (hiddenLabels.has(ds.label)) {
            ds.hidden = true;
          } else if (!chartData.focusLabel) {
            ds.hidden = false;
          }
        });
      }

      chart.current.options = options;

      chart.current.update(updateMode);

      setLegendItems(chart.current.legend.legendItems);
    }
  }, [chartData, options, updateMode, hiddenLabels]);

  // Re-run layout when annotations change so marker positions are recalculated
  useEffect(() => {
    chart.current?.update('none');
  }, [annotations]);

  return (
    <Column gap="6">
      <Box {...props}>
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
          <canvas ref={canvas} style={{ position: 'absolute', top: 0, left: 0 }} />
          {markers.length > 0 && (
            <ChartAnnotationMarkers
              markers={markers}
              onClick={onAnnotationClick}
              onMoreClick={onAnnotationMoreClick}
            />
          )}
        </div>
      </Box>
      <Legend items={legendItems} onClick={handleLegendClick} />
    </Column>
  );
}
