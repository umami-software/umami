import { useState, useRef, useEffect, useMemo, ReactNode } from 'react';
import { Loading } from 'react-basics';
import classNames from 'classnames';
import ChartJS, { LegendItem } from 'chart.js/auto';
import HoverTooltip from 'components/common/HoverTooltip';
import Legend from 'components/metrics/Legend';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import styles from './Chart.module.css';

export interface ChartProps {
  type?: 'bar' | 'bubble' | 'doughnut' | 'pie' | 'line' | 'polarArea' | 'radar' | 'scatter';
  data?: object;
  isLoading?: boolean;
  animationDuration?: number;
  updateMode?: string;
  onCreate?: (chart: any) => void;
  onUpdate?: (chart: any) => void;
  onTooltip?: (model: any) => void;
  className?: string;
  chartOptions?: { [key: string]: any };
  tooltip?: ReactNode;
}

export function Chart({
  type,
  data,
  isLoading = false,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  tooltip,
  updateMode,
  onCreate,
  onUpdate,
  onTooltip,
  className,
  chartOptions,
}: ChartProps) {
  const canvas = useRef();
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
          external: onTooltip,
        },
      },
      ...chartOptions,
    };
  }, [chartOptions]);

  const createChart = (data: any) => {
    ChartJS.defaults.font.family = 'Inter';

    chart.current = new ChartJS(canvas.current, {
      type,
      data,
      options,
    });

    onCreate?.(chart.current);

    setLegendItems(chart.current.legend.legendItems);
  };

  const updateChart = (data: any) => {
    chart.current.data.datasets.forEach((dataset: { data: any }, index: string | number) => {
      dataset.data = data?.datasets[index]?.data;
      chart.current.legend.legendItems[index].text = data?.datasets[index].label;
    });

    chart.current.options = options;

    // Allow config changes before update
    onUpdate?.(chart.current);

    setLegendItems(chart.current.legend.legendItems);

    chart.current.update(updateMode);
  };

  useEffect(() => {
    if (data) {
      if (!chart.current) {
        createChart(data);
      } else {
        updateChart(data);
      }
    }
  }, [data, options]);

  const handleLegendClick = (item: LegendItem) => {
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

  return (
    <>
      <div className={classNames(styles.chart, className)}>
        {isLoading && <Loading position="page" icon="dots" />}
        <canvas ref={canvas} />
      </div>
      <Legend items={legendItems} onClick={handleLegendClick} />
      {tooltip && (
        <HoverTooltip>
          <div className={styles.tooltip}>{tooltip}</div>
        </HoverTooltip>
      )}
    </>
  );
}

export default Chart;
