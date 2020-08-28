import React, { useState, useRef, useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import ChartJS from 'chart.js';
import styles from './BarChart.module.css';
import { format } from 'date-fns';

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

  const renderLabel = (label, index, values) => {
    const d = new Date(values[index].value);
    const n = records;

    switch (unit) {
      case 'hour':
        return format(d, 'ha');
      case 'day':
        if (n >= 15) {
          return index % ~~(n / 15) === 0 ? format(d, 'MMM d') : '';
        }
        return format(d, 'EEE M/d');
      case 'month':
        return format(d, 'MMMM');
      default:
        return label;
    }
  };

  const renderTooltip = model => {
    const { opacity, title, body, labelColors } = model;

    if (!opacity) {
      setTooltip(null);
    } else {
      const [label, value] = body[0].lines[0].split(':');

      setTooltip({
        title: title[0],
        value,
        label,
        labelColor: labelColors[0].backgroundColor,
      });
    }
  };

  const createChart = () => {
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
              tooltipFormat: 'ddd MMMM DD YYYY',
            },
            ticks: {
              callback: renderLabel,
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
  };

  const updateChart = () => {
    const { options } = chart.current;

    options.scales.xAxes[0].time.unit = unit;
    options.scales.xAxes[0].ticks.callback = renderLabel;
    options.animation.duration = animationDuration;

    onUpdate(chart.current);
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
  }, [datasets, unit, animationDuration]);

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
