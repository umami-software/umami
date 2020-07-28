import React, { useRef, useEffect, useMemo } from 'react';
import ChartJS from 'chart.js';
import { getLocalTime } from 'lib/date';

export default function PageviewsChart({ data }) {
  const canvas = useRef();
  const chart = useRef();
  const pageviews = useMemo(() => {
    if (data) {
      return data.pageviews.map(({ t, y }) => ({ t: getLocalTime(t), y }));
    }
    return [];
  }, [data]);

  function draw() {
    if (!canvas.current) return;

    if (!chart.current) {
      chart.current = new ChartJS(canvas.current, {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'page views',
              data: pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.1)',
              borderColor: 'rgb(13, 102, 208, 0.2)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          animation: {
            duration: 300,
          },
          tooltips: {
            intersect: false,
          },
          hover: {
            animationDuration: 0,
          },
          scales: {
            xAxes: [
              {
                type: 'time',
                distribution: 'series',
                offset: true,
                time: {
                  displayFormats: {
                    day: 'ddd M/DD',
                  },
                  tooltipFormat: 'ddd M/DD hA',
                },
              },
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    } else {
      chart.current.data.datasets[0].data = pageviews;
      chart.current.update();
    }
  }

  useEffect(() => {
    if (data) {
      draw();
    }
  }, [data]);

  return (
    <div>
      <canvas ref={canvas} width={960} height={400} />
    </div>
  );
}
