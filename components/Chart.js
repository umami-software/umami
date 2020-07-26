import React, { useState, useMemo, useRef, useEffect } from 'react';
import ChartJS from 'chart.js';
import { format, subDays, subHours, startOfHour } from 'date-fns';
import { get } from 'lib/web';

export default function Chart({ websiteId, startDate, endDate }) {
  const [data, setData] = useState();
  const canvas = useRef();
  const chart = useRef();
  const metrics = useMemo(() => {
    if (data) {
      const points = {};
      const now = startOfHour(new Date());

      for (let i = 0; i <= 168; i++) {
        const d = new Date(subHours(now, 168 - i));
        const key = format(d, 'yyyy-MM-dd-HH');
        points[key] = { t: startOfHour(d).toISOString(), y: 0 };
      }

      data.pageviews.forEach(e => {
        const key = format(new Date(e.created_at), 'yyyy-MM-dd-HH');
        points[key].y += 1;
      });

      return points;
    }
  }, [data]);
  console.log(metrics);

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/pageviews`, {
        start_at: startDate,
        end_at: endDate,
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
                time: {
                  unit: 'hour',
                  displayFormats: {
                    hour: 'ddd M/DD',
                  },
                  tooltipFormat: 'ddd M/DD hA',
                },
                ticks: {
                  autoSkip: true,
                  minRotation: 0,
                  maxRotation: 0,
                  maxTicksLimit: 7,
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
