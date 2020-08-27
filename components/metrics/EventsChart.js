import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import BarChart from './BarChart';
import { get } from 'lib/web';
import { getTimezone, getDateArray, getDateLength } from 'lib/date';
import styles from './PageviewsChart.module.css';

const COLORS = [
  'rgba(38, 128, 235, 0.5)',
  'rgba(146, 86, 217, 0.5)',
  'rgba(45, 157, 120, 0.5)',
  'rgba(216, 55, 144, 0.5)',
  'rgba(227, 72, 80, 0.5)',
  'rgba(103, 103, 236, 0.5)',
  'rgba(68, 181, 86, 0.5)',
];

export default function EventsChart({ websiteId, startDate, endDate, unit, className }) {
  const [data, setData] = useState();
  const datasets = useMemo(() => {
    if (!data) return [];

    return Object.keys(data).map((key, index) => ({
      label: key,
      data: data[key],
      lineTension: 0,
      backgroundColor: COLORS[index],
      borderColor: COLORS[index],
      borderWidth: 1,
    }));
  }, [data]);

  async function loadData() {
    const data = await get(`/api/website/${websiteId}/events`, {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: getTimezone(),
    });
    console.log({ data });
    const map = data.reduce((obj, { x, t, y }) => {
      if (!obj[x]) {
        obj[x] = [];
      }

      obj[x].push({ t, y });

      return obj;
    }, {});

    Object.keys(map).forEach(key => {
      map[key] = getDateArray(map[key], startDate, endDate, unit);
    });

    setData(map);
  }

  function handleUpdate(chart) {
    chart.data.datasets = datasets;

    chart.update();
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate]);

  if (!data) {
    return null;
  }

  return (
    <div className={classNames(styles.chart, className)}>
      <BarChart
        chartId={websiteId}
        datasets={datasets}
        unit={unit}
        records={getDateLength(startDate, endDate, unit)}
        onUpdate={handleUpdate}
        stacked
      />
    </div>
  );
}
