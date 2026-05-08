import { Box, type BoxProps, Column } from '@umami/react-zen';
import ChartJS, {
  type ChartData,
  type ChartOptions,
  type LegendItem,
  type UpdateMode,
} from 'chart.js/auto';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Legend } from '@/components/metrics/Legend';
import { DEFAULT_ANIMATION_DURATION } from '@/lib/constants';

ChartJS.defaults.font.family = 'Inter';

export interface ChartProps extends BoxProps {
  type?: 'bar' | 'bubble' | 'doughnut' | 'pie' | 'line' | 'polarArea' | 'radar' | 'scatter';
  chartData?: ChartData & { focusLabel?: string };
  chartOptions?: ChartOptions;
  updateMode?: UpdateMode;
  animationDuration?: number;
  onTooltip?: (model: any) => void;
  hiddenLabels?: Set<string>;
  onLegendClick?: (label: string, willBeHidden: boolean) => void;
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
  ...props
}: ChartProps) {
  const canvas = useRef(null);
  const chart = useRef(null);
  const [legendItems, setLegendItems] = useState([]);

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
      // Controlled mode: caller owns the hidden state. We report the click
      // and let the parent push a new hiddenLabels set on the next render.
      const { datasetIndex } = item;
      const ds = chart.current.data.datasets[datasetIndex];
      onLegendClick(ds.label, !ds.hidden);
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

      // Re-apply caller-driven hidden flags after focusLabel handling so a
      // dataset stays hidden across data changes (e.g. date-range switches)
      // even though Chart.js regenerates dataset meta on every replace.
      if (hiddenLabels) {
        chart.current.data.datasets.forEach((ds: { hidden: boolean; label: any }) => {
          if (hiddenLabels.has(ds.label)) {
            ds.hidden = true;
          } else if (!chartData.focusLabel) {
            // Explicitly reset so un-hiding a label is always reflected,
            // regardless of whether the focusLabel pass ran above.
            ds.hidden = false;
          }
        });
      }

      chart.current.options = options;

      chart.current.update(updateMode);

      setLegendItems(chart.current.legend.legendItems);
    }
  }, [chartData, options, updateMode, hiddenLabels]);

  return (
    <Column gap="6">
      <Box {...props}>
        <canvas ref={canvas} />
      </Box>
      <Legend items={legendItems} onClick={handleLegendClick} />
    </Column>
  );
}
