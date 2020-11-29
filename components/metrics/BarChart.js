import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import ChartJS from 'chart.js';
import Legend from 'components/metrics/Legend';
import { formatLongNumber } from 'lib/format';
import { dateFormat } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import useTheme from 'hooks/useTheme';
import { DEFAUL_CHART_HEIGHT, DEFAULT_ANIMATION_DURATION, THEME_COLORS } from 'lib/constants';
import styles from './BarChart.module.css';
import ChartTooltip from './ChartTooltip';
import useForceUpdate from '../../hooks/useForceUpdate';

export default function BarChart({
  chartId,
  datasets,
  unit,
  records,
  height = DEFAUL_CHART_HEIGHT,
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
  const [locale] = useLocale();
  const [theme] = useTheme();
  const forceUpdate = useForceUpdate();

  const colors = {
    text: THEME_COLORS[theme].gray700,
    line: THEME_COLORS[theme].gray200,
    zeroLine: THEME_COLORS[theme].gray500,
  };

  function renderXLabel(label, index, values) {
    if (loading) return '';
    const d = new Date(values[index].value);
    const w = canvas.current.width;

    switch (unit) {
      case 'minute':
        return index % 2 === 0 ? dateFormat(d, 'h:mm', locale) : '';
      case 'hour':
        return dateFormat(d, 'ha', locale);
      case 'day':
        if (records > 31) {
          if (w <= 500) {
            return index % 10 === 0 ? dateFormat(d, 'M/d', locale) : '';
          }
          return index % 5 === 0 ? dateFormat(d, 'M/d', locale) : '';
        }
        if (w <= 500) {
          return index % 2 === 0 ? dateFormat(d, 'MMM d', locale) : '';
        }
        return dateFormat(d, 'EEE M/d', locale);
      case 'month':
        if (w <= 660) {
          return index % 2 === 0 ? dateFormat(d, 'MMM', locale) : '';
        }
        return dateFormat(d, 'MMM', locale);
      default:
        return label;
    }
  }

  function renderYLabel(label) {
    return +label > 1000 ? formatLongNumber(label) : label;
  }

  function renderTooltip(model) {
    const { opacity, title, body, labelColors } = model;

    if (!opacity || !title) {
      setTooltip(null);
      return;
    }

    const [label, value] = body[0].lines[0].split(':');

    setTooltip({
      title: dateFormat(new Date(+title[0]), getTooltipFormat(unit), locale),
      value,
      label,
      labelColor: labelColors[0].backgroundColor,
    });
  }

  function getTooltipFormat(unit) {
    switch (unit) {
      case 'hour':
        return 'EEE ha — MMM d yyyy';
      default:
        return 'EEE MMMM d yyyy';
    }
  }

  function createChart() {
    const options = {
      animation: {
        duration: animationDuration,
      },
      tooltips: {
        enabled: false,
        custom: renderTooltip,
      },
      hover: {
        animationDuration: 0,
      },
      responsive: true,
      responsiveAnimationDuration: 0,
      maintainAspectRatio: false,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            distribution: 'series',
            time: {
              unit,
              tooltipFormat: 'x',
            },
            ticks: {
              callback: renderXLabel,
              minRotation: 0,
              maxRotation: 0,
              fontColor: colors.text,
            },
            gridLines: {
              display: false,
            },
            offset: true,
            stacked: true,
          },
        ],
        yAxes: [
          {
            ticks: {
              callback: renderYLabel,
              beginAtZero: true,
              fontColor: colors.text,
            },
            gridLines: {
              color: colors.line,
              zeroLineColor: colors.zeroLine,
            },
            stacked,
          },
        ],
      },
    };

    onCreate(options);

    chart.current = new ChartJS(canvas.current, {
      type: 'bar',
      data: {
        datasets,
      },
      options,
    });
  }

  function updateChart() {
    const { options } = chart.current;

    options.legend.labels.fontColor = colors.text;
    options.scales.xAxes[0].time.unit = unit;
    options.scales.xAxes[0].ticks.callback = renderXLabel;
    options.scales.xAxes[0].ticks.fontColor = colors.text;
    options.scales.yAxes[0].ticks.fontColor = colors.text;
    options.scales.yAxes[0].ticks.precision = 0;
    options.scales.yAxes[0].gridLines.color = colors.line;
    options.scales.yAxes[0].gridLines.zeroLineColor = colors.zeroLine;
    options.animation.duration = animationDuration;
    options.tooltips.custom = renderTooltip;

    onUpdate(chart.current);

    chart.current.update();

    forceUpdate();
  }

  useEffect(() => {
    if (datasets) {
      if (!chart.current) {
        createChart();
      } else {
        setTooltip(null);
        updateChart();
      }
    }
  }, [datasets, unit, animationDuration, locale, theme]);

  return (
    <>
      <div
        data-tip=""
        data-for={`${chartId}-tooltip`}
        className={classNames(styles.chart, className)}
        style={{ height }}
      >
        <canvas ref={canvas} />
      </div>
      <Legend chart={chart.current} />
      <ChartTooltip chartId={chartId} tooltip={tooltip} />
    </>
  );
}
