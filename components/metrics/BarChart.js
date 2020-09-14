import React, { useState, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import ChartJS from 'chart.js';
import { formatLongNumber } from 'lib/format';
import { dateFormat } from 'lib/lang';
import useLocale from 'hooks/useLocale';
import styles from './BarChart.module.css';

export default function BarChart({
  chartId,
  datasets,
  unit,
  records,
  height = 400,
  animationDuration = 300,
  className,
  stacked = false,
  onCreate = () => {},
  onUpdate = () => {},
}) {
  const canvas = useRef();
  const chart = useRef();
  const [tooltip, setTooltip] = useState({});
  const [locale] = useLocale();

  function renderXLabel(label, index, values) {
    const d = new Date(values[index].value);
    const w = canvas.current.width;

    switch (unit) {
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
    return +label > 1 ? formatLongNumber(label) : label;
  }

  function renderTooltip(model) {
    const { opacity, title, body, labelColors } = model;

    if (!opacity) {
      setTooltip(null);
    } else {
      const [label, value] = body[0].lines[0].split(':');

      setTooltip({
        title: dateFormat(new Date(+title[0]), getTooltipFormat(unit), locale),
        value,
        label,
        labelColor: labelColors[0].backgroundColor,
      });
    }
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

    options.scales.xAxes[0].time.unit = unit;
    options.scales.xAxes[0].ticks.callback = renderXLabel;
    options.animation.duration = animationDuration;
    options.tooltips.custom = renderTooltip;

    onUpdate(chart.current);
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
  }, [datasets, unit, animationDuration, locale]);

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
      <ReactTooltip id={`${chartId}-tooltip`}>
        {tooltip ? <Tooltip {...tooltip} /> : null}
      </ReactTooltip>
    </>
  );
}

const Tooltip = ({ title, value, label, labelColor }) => (
  <div className={styles.tooltip}>
    <div className={styles.content}>
      <div className={styles.title}>{title}</div>
      <div className={styles.metric}>
        <div className={styles.dot}>
          <div className={styles.color} style={{ backgroundColor: labelColor }} />
        </div>
        {value} {label}
      </div>
    </div>
  </div>
);
