import React, { useState, useEffect, useMemo } from 'react';
import PageviewsChart from './PageviewsChart';
import { get } from 'lib/web';
import { getDateArray, getTimezone } from 'lib/date';
import WebsiteSummary from './WebsiteSummary';
import styles from './WebsiteStats.module.css';

export default function WebsiteStats({ title, websiteId, startDate, endDate, unit }) {
  const [data, setData] = useState();
  const [pageviews, uniques] = useMemo(() => {
    if (data) {
      return [
        getDateArray(data.pageviews, startDate, endDate, unit),
        getDateArray(data.uniques, startDate, endDate, unit),
      ];
    }
    return [[], []];
  }, [data]);

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
      <WebsiteSummary websiteId={websiteId} startDate={startDate} endDate={endDate} />
      <PageviewsChart data={{ pageviews, uniques }} unit={unit} />
    </div>
  );
}
