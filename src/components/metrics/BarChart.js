import { useState, useRef, useEffect, useCallback } from 'react';
import { Loading } from 'react-basics';
import classNames from 'classnames';
import Chart from 'chart.js/auto';
import HoverTooltip from 'components/common/HoverTooltip';
import Legend from 'components/metrics/Legend';
import useLocale from 'components/hooks/useLocale';
import useTheme from 'components/hooks/useTheme';
import { DEFAULT_ANIMATION_DURATION } from 'lib/constants';
import { renderNumberLabels } from 'lib/charts';
import styles from './BarChart.module.css';

export function BarChart({
  datasets,
  unit,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  stacked = false,
  loading = false,
  renderXLabel,
  renderYLabel,
  XAxisType = 'time',
  YAxisType = 'linear',
  renderTooltipPopup,
  onCreate,
  onUpdate,
  className,
}) {
  const canvas = useRef();
  const chart = useRef(null);
  const [tooltip, setTooltipPopup] = useState(null);
  const { locale } = useLocale();
  const { theme, colors } = useTheme();

  const getOptions = useCallback(() => {
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
          external: renderTooltipPopup ? renderTooltipPopup.bind(null, setTooltipPopup) : undefined,
        },
      },
      scales: {
        x: {
          type: XAxisType,
          stacked: true,
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
            color: colors.text,
            callback: renderYLabel || renderNumberLabels,
          },
        },
      },
    };
  }, [
    animationDuration,
    renderTooltipPopup,
    renderXLabel,
    XAxisType,
    YAxisType,
    stacked,
    colors,
    unit,
    locale,
  ]);

  const createChart = () => {
    Chart.defaults.font.family = 'Inter';

    const options = getOptions();

    chart.current = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets,
      },
      options,
    });

    onCreate?.(chart.current);
  };

  const updateChart = () => {
    setTooltipPopup(null);

    datasets.forEach((dataset, index) => {
      chart.current.data.datasets[index].data = dataset.data;
      chart.current.data.datasets[index].label = dataset.label;
    });

    chart.current.options = getOptions();

    onUpdate?.(chart.current);

    chart.current.update();
  };

  useEffect(() => {
    if (datasets) {
      if (!chart.current) {
        createChart();
      } else {
        updateChart();
      }
    }
  }, [datasets, unit, theme, animationDuration, locale]);

  return (
    <div className={styles.container}>
      <div className={classNames(styles.chart, className)}>
        {loading && <Loading position="page" icon="dots" />}
        <canvas ref={canvas} />
      </div>
      <Legend chart={chart.current} />
      {tooltip && (
        <HoverTooltip>
          <div className={styles.tooltip}>{tooltip}</div>
        </HoverTooltip>
      )}
    </div>
  );
}

export default BarChart;
