import React, { useMemo } from 'react';
import { colord } from 'colord';
import BarChart from './BarChart';
import { getDateArray, getDateLength } from 'lib/date';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import useTimezone from 'hooks/useTimezone';
import usePageQuery from 'hooks/usePageQuery';
import { EVENT_COLORS } from 'lib/constants';

export default function EventsChart({ websiteId, className, token }) {
  const [{ startDate, endDate, unit, modified }] = useDateRange(websiteId);
  const [timezone] = useTimezone();
  const {
    query: { url, eventType },
  } = usePageQuery();

  const { data, loading } = useFetch(
    `/website/${websiteId}/events`,
    {
      params: {
        start_at: +startDate,
        end_at: +endDate,
        unit,
        tz: timezone,
        url,
        event_type: eventType,
        token,
      },
    },
    [modified, eventType],
  );

  const datasets = useMemo(() => {
    if (!data) return [];
    if (loading) return data;

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
      const color = colord(EVENT_COLORS[index % EVENT_COLORS.length]);
      return {
        label: key,
        data: map[key],
        lineTension: 0,
        backgroundColor: color.alpha(0.6).toRgbString(),
        borderColor: color.alpha(0.7).toRgbString(),
        borderWidth: 1,
      };
    });
  }, [data, loading]);

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
      className={className}
      datasets={datasets}
      unit={unit}
      height={300}
      records={getDateLength(startDate, endDate, unit)}
      onUpdate={handleUpdate}
      loading={loading}
      stacked
    />
  );
}
