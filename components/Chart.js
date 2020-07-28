import React, { useState, useMemo, useRef, useEffect } from 'react';
import ChartJS from 'chart.js';
import { get } from 'lib/web';
import { getTimezone, getLocalTime } from 'lib/date';

export default function Chart({ websiteId, startDate, endDate }) {
  const [data, setData] = useState();
  const canvas = useRef();
  const chart = useRef();
  const metrics = useMemo(() => {
    if (data) {
      return data.pageviews.map(({ t, y }) => ({ t: getLocalTime(t), y }));
    }
  }, [data]);
  console.log(metrics);

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/pageviews`, {
        start_at: +startDate,
        end_at: +endDate,
        tz: getTimezone(),
      }),
    );
  }

  function draw() {
    if (!chart.current && canvas.current) {
      chart.current = new ChartJS(canvas.current, {
        type: 'bar',
        data: {
          datasets: [
            {
              label: 'page views',
              data: Object.values(metrics),
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
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (metrics) {
      draw();
    }
  }, [metrics]);

  return (
    <div>
      <canvas ref={canvas} width={960} height={400} />
    </div>
  );
}
