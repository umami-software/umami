import { useState, useRef, useEffect, useMemo } from 'react';
import { StatusLight } from 'react-basics';
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

export default function BarChart({
  datasets,
  unit,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  className,
  stacked = false,
  loading = false,
  onCreate = () => {},
  onUpdate = () => {},
}) {
  const canvas = useRef();
  const chart = useRef();
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

  const renderTooltip = model => {
    const { opacity, labelColors, dataPoints } = model.tooltip;

    if (!dataPoints?.length || !opacity) {
      setTooltip(null);
      return;
    }

    const format = unit === 'hour' ? 'EEE p — PPP' : 'PPPP';

    setTooltip(
      <>
        <div>{dateFormat(new Date(dataPoints[0].raw.x), format, locale)}</div>
        <div>
          <StatusLight color={labelColors?.[0]?.backgroundColor}>
            <b>
              {formatLongNumber(dataPoints[0].raw.y)} {dataPoints[0].dataset.label}
            </b>
          </StatusLight>
        </div>
      </>,
    );
  };

  const createChart = () => {
    Chart.defaults.font.family = 'Inter';

    const options = {
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

    onCreate(options);

    chart.current = new Chart(canvas.current, {
      type: 'bar',
      data: {
        datasets,
      },
      options,
    });
  };

  const updateChart = () => {
    const { animation, scales } = chart.current.options;

    animation.duration = animationDuration;
    scales.x.ticks.color = colors.text;
    scales.x.time.unit = unit;
    scales.x.border.color = colors.line;
    scales.y.ticks.color = colors.text;
    scales.y.grid.color = colors.line;
    scales.y.border.color = colors.line;

    onUpdate(chart.current);

    chart.current.update();
  };

  useEffect(() => {
    if (datasets) {
      if (!chart.current) {
        createChart();
      } else {
        setTooltip(null);
        updateChart();
      }
    }
  }, [datasets, unit, theme, animationDuration, locale, loading]);

  return (
    <>
      <div className={classNames(styles.chart, className)}>
        <canvas ref={canvas} />
      </div>
      <Legend chart={chart.current} />
      {tooltip && <HoverTooltip tooltip={tooltip} />}
    </>
  );
}
