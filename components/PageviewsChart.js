import React, { useRef, useEffect } from 'react';
import ChartJS from 'chart.js';

export default function PageviewsChart({ data }) {
  const canvas = useRef();
  const chart = useRef();

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
              backgroundColor: 'rgb(146, 86, 217, 0.2)',
              borderColor: 'rgb(122, 66, 191, 0.3)',
              borderWidth: 1,
            },
            {
              label: 'page views',
              data: data.pageviews,
              lineTension: 0,
              backgroundColor: 'rgb(38, 128, 235, 0.2)',
              borderColor: 'rgb(13, 102, 208, 0.3)',
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
                gridLines: {
                  display: false,
                },
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
      chart.current.data.datasets[0].data = data.uniques;
      chart.current.data.datasets[1].data = data.pageviews;
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
