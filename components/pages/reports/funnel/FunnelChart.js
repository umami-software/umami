import Chart from 'chart.js/auto';
import classNames from 'classnames';
import { colord } from 'colord';
import HoverTooltip from 'components/common/HoverTooltip';
import Legend from 'components/metrics/Legend';
import useLocale from 'hooks/useLocale';
import useMessages from 'hooks/useMessages';
import useTheme from 'hooks/useTheme';
import { DEFAULT_ANIMATION_DURATION, THEME_COLORS } from 'lib/constants';
import { formatLongNumber } from 'lib/format';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loading, StatusLight } from 'react-basics';
import styles from './FunnelChart.module.css';

export function FunnelChart({
  data,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  stacked = false,
  loading = false,
  onCreate = () => {},
  onUpdate = () => {},
  className,
}) {
  const { formatMessage, labels } = useMessages();
  const canvas = useRef();
  const chart = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const { locale } = useLocale();
  const [theme] = useTheme();

  const datasets = useMemo(() => {
    const primaryColor = colord(THEME_COLORS[theme].primary);
    return [
      {
        label: formatMessage(labels.uniqueVisitors),
        data: data,
        borderWidth: 1,
        hoverBackgroundColor: primaryColor.alpha(0.9).toRgbString(),
        backgroundColor: primaryColor.alpha(0.6).toRgbString(),
        borderColor: primaryColor.alpha(0.9).toRgbString(),
        hoverBorderColor: primaryColor.toRgbString(),
      },
    ];
  }, [data]);

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

  const renderTooltip = useCallback(model => {
    const { opacity, labelColors, dataPoints } = model.tooltip;

    if (!dataPoints?.length || !opacity) {
      setTooltip(null);
      return;
    }

    setTooltip(
      <div className={styles.tooltip}>
        <div>
          <StatusLight color={labelColors?.[0]?.backgroundColor}>
            <div className={styles.value}>
              <div>{dataPoints[0].raw.x}</div>
              <div>{formatLongNumber(dataPoints[0].raw.y)}</div>
            </div>
          </StatusLight>
        </div>
      </div>,
    );
  }, []);

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
  }, [animationDuration, renderTooltip, stacked, colors, locale]);

  const createChart = () => {
    Chart.defaults.font.family = 'Inter';

    const options = getOptions();

    chart.current = new Chart(canvas.current, {
      type: 'bar',
      data: { datasets },
      options,
    });

    onCreate(chart.current);
  };

  const updateChart = () => {
    setTooltip(null);

    chart.current.data.datasets[0].data = datasets[0].data;
    chart.current.data.datasets[0].label = datasets[0].label;

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
  }, [datasets, theme, animationDuration, locale]);

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

export default FunnelChart;
