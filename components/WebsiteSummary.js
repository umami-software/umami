import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import { get } from '../lib/web';
import styles from './WebsiteSummary.module.css';

export default function WebsiteSummary({ websiteId, startDate, endDate }) {
  const [data, setData] = useState({});
  const { pageviews, uniques, bounces } = data;

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/summary`, {
        start_at: +startDate,
        end_at: +endDate,
      }),
    );
  }

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  return (
    <div className={styles.container}>
      <MetricCard label="Views" value={pageviews} />
      <MetricCard label="Visitors" value={uniques} />
      <MetricCard label="Bounce rate" value={`${~~((bounces / uniques) * 100)}%`} />
    </div>
  );
}
