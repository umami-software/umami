import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChartJS from 'chart.js';
import { format } from 'date-fns';
import styles from './PageviewsChart.module.css';

export default function PageviewsChart({ data, unit }) {
  const canvas = useRef();
  const chart = useRef();
  const [tooltip, setTooltip] = useState({});

  const renderLabel = useCallback(
    (label, index, values) => {
      const d = new Date(values[index].value);
      switch (unit) {
        case 'day':
          if (data.pageviews.length > 7) {
            return index % 2 !== 0 ? format(d, 'MMM d') : '';
          }
          return format(d, 'EEE M/d');
        default:
          return label;
      }
    },
    [unit, data],
  );

  const renderTooltip = model => {
    const { caretX, caretY, opacity, title, body, labelColors } = model;
    console.log(model);

    if (!opacity) {
      setTooltip({ opacity });
    } else {
      const [label, value] = body[0].lines[0].split(':');

      setTooltip({
        top: caretY,
        left: caretX,
        opacity,
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
              backgroundColor: 'rgb(146, 86, 217, 0.4)',
              borderColor: 'rgb(122, 66, 191, 0.4)',
              borderWidth: 1,
            },
            {
              label: 'page views',
              data: data.pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.4)',
              borderColor: 'rgb(13, 102, 208, 0.4)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          animation: {
            duration: 300,
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

      chart.current.update();
    }
  }

  useEffect(() => {
    if (data) {
      draw();
    }
  }, [data]);

  return (
    <div className={styles.chart}>
      <canvas ref={canvas} width={960} height={400} />
      <Tootip {...tooltip} />
    </div>
  );
}

const Tootip = ({ top, left, opacity, title, value, label, labelColor }) => (
  <div className={styles.tooltip} style={{ top, left, opacity }}>
    <div className={styles.content}>
      <div className={styles.title}>{title}</div>
      <div className={styles.metric}>
        <div className={styles.dot} style={{ backgroundColor: labelColor }} />
        {value} {label}
      </div>
    </div>
  </div>
);
