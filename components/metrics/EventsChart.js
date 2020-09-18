import React, { useMemo } from 'react';
import tinycolor from 'tinycolor2';
import BarChart from './BarChart';
import { getTimezone, getDateArray, getDateLength } from 'lib/date';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';

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

export default function EventsChart({ websiteId, token }) {
  const dateRange = useDateRange(websiteId);
  const { startDate, endDate, unit, modified } = dateRange;
  const { data } = useFetch(
    `/api/website/${websiteId}/events`,
    {
      start_at: +startDate,
      end_at: +endDate,
      unit,
      tz: getTimezone(),
      token,
    },
    { update: [modified] },
  );
  const datasets = useMemo(() => {
    if (!data) return [];

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

    return Object.keys(map).map((key, index) => {
      const color = tinycolor(COLORS[index]);
      return {
        label: key,
        data: map[key],
        lineTension: 0,
        backgroundColor: color.setAlpha(0.4).toRgbString(),
        borderColor: color.setAlpha(0.5).toRgbString(),
        borderWidth: 1,
      };
    });
  }, [data]);

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
