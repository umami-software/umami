import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { StatusLight, Loading } from 'react-basics';
import classNames from 'classnames';
import Chart from 'chart.js/auto';
import HoverTooltip from 'components/common/HoverTooltip';
import Legend from 'components/metrics/Legend';
import { formatLongNumber } from 'lib/format';
import { dateFormat } from 'lib/date';
import useLocale from 'hooks/useLocale';
import useTheme from 'hooks/useTheme';
import { DEFAULT_ANIMATION_DURATION, THEME_COLORS } from 'lib/constants';
import styles from './BarChart.module.css';

export function BarChart({
  datasets,
  unit,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  stacked = false,
  loading = false,
  onCreate = () => {},
  onUpdate = () => {},
  className,
}) {
  const canvas = useRef();
  const chart = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const { locale } = useLocale();
  const [theme] = useTheme();

  const colors = useMemo(
    () => ({
      text: THEME_COLORS[theme].gray700,
      line: THEME_COLORS[theme].gray200,
    }),
    [theme],
  );

  const renderYLabel = label => {
    return +label > 1000 ? formatLongNumber(label) : label;
  };

  const renderXLabel = useCallback(
    (label, index, values) => {
      const d = new Date(values[index].value);

      switch (unit) {
        case 'minute':
          return dateFormat(d, 'h:mm', locale);
        case 'hour':
          return dateFormat(d, 'p', locale);
        case 'day':
          return dateFormat(d, 'MMM d', locale);
        case 'month':
          return dateFormat(d, 'MMM', locale);
        default:
          return label;
      }
    },
    [locale, unit],
  );

  const renderTooltip = useCallback(
    model => {
      const { opacity, labelColors, dataPoints } = model.tooltip;

      if (!dataPoints?.length || !opacity) {
        setTooltip(null);
        return;
      }

      const formats = {
        millisecond: 'T',
        second: 'pp',
        minute: 'p',
        hour: 'h:mm aaa - PP',
        day: 'PPPP',
        week: 'PPPP',
        month: 'LLLL yyyy',
        quarter: 'qqq',
        year: 'yyyy',
      };

      setTooltip(
        <div className={styles.tooltip}>
          <div>{dateFormat(new Date(dataPoints[0].raw.x), formats[unit], locale)}</div>
          <div>
            <StatusLight color={labelColors?.[0]?.backgroundColor}>
              <div className={styles.value}>
                {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
              </div>
            </StatusLight>
          </div>
        </div>,
      );
    },
    [unit],
  );

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
          external: renderTooltip,
        },
      },
      scales: {
        x: {
          type: 'time',
          stacked: true,
          time: {
            unit,
          },
          grid: {
            display: false,
          },
          border: {
            color: colors.line,
          },
          ticks: {
            color: colors.text,
            autoSkip: false,
            maxRotation: 0,
            callback: renderXLabel,
          },
        },
        y: {
          type: 'linear',
          min: 0,
          beginAtZero: true,
          stacked,
          grid: {
            color: colors.line,
          },
          border: {
            color: colors.line,
          },
          ticks: {
            color: colors.text,
            callback: renderYLabel,
          },
        },
      },
    };
  }, [animationDuration, renderTooltip, renderXLabel, stacked, colors, unit, locale]);

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

    onCreate(chart.current);
  };

  const updateChart = () => {
    setTooltip(null);

    datasets.forEach((dataset, index) => {
      chart.current.data.datasets[index].data = dataset.data;
      chart.current.data.datasets[index].label = dataset.label;
    });

    chart.current.options = getOptions();

    onUpdate(chart.current);

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
    <>
      <div className={classNames(styles.chart, className)}>
        {loading && <Loading position="page" icon="dots" />}
        <canvas ref={canvas} />
      </div>
      <Legend chart={chart.current} />
      {tooltip && <HoverTooltip tooltip={tooltip} />}
    </>
  );
}

export default BarChart;
