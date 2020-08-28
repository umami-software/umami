import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';
import BarChart from './BarChart';
import { get } from 'lib/web';
import { getTimezone, getDateArray, getDateLength } from 'lib/date';
import styles from './BarChart.module.css';

const COLORS = [
  '#2680eb',
  '#9256d9',
  '#44b556',
  '#e68619',
  '#e34850',
  '#1b959a',
  '#d83790',
  '#85d044',
];

export default function EventsChart({ websiteId, startDate, endDate, unit }) {
  const [data, setData] = useState();
  const datasets = useMemo(() => {
    if (!data) return [];

    return Object.keys(data).map((key, index) => {
      const color = tinycolor(COLORS[index]);
      return {
        label: key,
        data: data[key],
        lineTension: 0,
        backgroundColor: color.setAlpha(0.4).toRgbString(),
        borderColor: color.setAlpha(0.5).toRgbString(),
        borderWidth: 1,
      };
    });
  }, [data]);

  async function loadData() {
    const data = await get(`/api/website/${websiteId}/events`, {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: getTimezone(),
    });

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

  function handleCreate(options) {
    const legend = {
      position: 'bottom',
    };

    options.legend = legend;
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
    <BarChart
      chartId={`events-${websiteId}`}
      datasets={datasets}
      unit={unit}
      records={getDateLength(startDate, endDate, unit)}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      stacked
    />
  );
}
