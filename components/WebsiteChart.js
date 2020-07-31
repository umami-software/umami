import React, { useState, useEffect, useMemo } from 'react';
import PageviewsChart from './PageviewsChart';
import { get } from 'lib/web';
import { getDateArray, getDateRange, getTimezone } from 'lib/date';
import MetricsBar from './MetricsBar';
import QuickButtons from './QuickButtons';
import styles from './WebsiteChart.module.css';
import DateFilter from './DateFilter';

export default function WebsiteChart({ title, websiteId }) {
  const [data, setData] = useState();
  const [dateRange, setDateRange] = useState(getDateRange('7day'));
  const { startDate, endDate, unit, value } = dateRange;

  const [pageviews, uniques] = useMemo(() => {
    if (data) {
      return [
        getDateArray(data.pageviews, startDate, endDate, unit),
        getDateArray(data.uniques, startDate, endDate, unit),
      ];
    }
    return [[], []];
  }, [data]);

  function handleDateChange(values) {
    setDateRange(values);
  }

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/pageviews`, {
        start_at: +startDate,
        end_at: +endDate,
        unit,
        tz: getTimezone(),
      }),
    );
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate, unit]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <div className={styles.header}>
        <MetricsBar websiteId={websiteId} startDate={startDate} endDate={endDate} />
        <DateFilter value={value} onChange={handleDateChange} />
      </div>
      <PageviewsChart data={{ pageviews, uniques }} unit={unit}>
        <QuickButtons value={value} onChange={handleDateChange} />
      </PageviewsChart>
    </div>
  );
}
