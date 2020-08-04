import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactTooltip from 'react-tooltip';
import classNames from 'classnames';
import ChartJS from 'chart.js';
import { format } from 'date-fns';
import styles from './PageviewsChart.module.css';

export default function PageviewsChart({
  websiteId,
  data,
  unit,
  animationDuration = 300,
  className,
  children,
}) {
  const canvas = useRef();
  const chart = useRef();
  const [tooltip, setTooltip] = useState({});

  const renderLabel = useCallback(
    (label, index, values) => {
      const d = new Date(values[index].value);
      const n = data.pageviews.length;

      switch (unit) {
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
    },
    [unit, data],
  );

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

  function draw() {
    if (!canvas.current) return;

    if (!chart.current) {
      chart.current = new ChartJS(canvas.current, {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'unique visitors',
              data: data.uniques,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.4)',
              borderColor: 'rgb(13, 102, 208, 0.4)',
              borderWidth: 1,
            },
            {
              label: 'page views',
              data: data.pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.2)',
              borderColor: 'rgb(13, 102, 208, 0.2)',
              borderWidth: 1,
            },
          ],
        },
        options: {
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
                stacked: true,
              },
            ],
          },
        },
      });
    } else {
      const {
        data: { datasets },
        options,
      } = chart.current;

      datasets[0].data = data.uniques;
      datasets[1].data = data.pageviews;
      options.scales.xAxes[0].time.unit = unit;
      options.scales.xAxes[0].ticks.callback = renderLabel;
      options.animation.duration = animationDuration;

      chart.current.update();
    }
  }

  useEffect(() => {
    if (data) {
      draw();
      setTooltip(null);
    }
  }, [data]);

  return (
    <div
      data-tip=""
      data-for={`${websiteId}-tooltip`}
      className={classNames(styles.chart, className)}
    >
      <canvas ref={canvas} width={960} height={400} />
      <ReactTooltip id={`${websiteId}-tooltip`}>
        {tooltip ? <Tooltip {...tooltip} /> : null}
      </ReactTooltip>
      {children}
    </div>
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
