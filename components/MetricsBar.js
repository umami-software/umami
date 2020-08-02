import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import MetricCard from './MetricCard';
import { get } from 'lib/web';
import { formatShortTime } from 'lib/format';
import styles from './MetricsBar.module.css';

export default function MetricsBar({ websiteId, startDate, endDate, className }) {
  const [data, setData] = useState({});
  const { pageviews, uniques, bounces, totaltime } = data;

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/metrics`, {
        start_at: +startDate,
        end_at: +endDate,
      }),
    );
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate]);

  return (
    <div className={classNames(styles.container, className)}>
      <MetricCard label="Views" value={pageviews} />
      <MetricCard label="Visitors" value={uniques} />
      <MetricCard
        label="Bounce rate"
        value={uniques ? (bounces / uniques) * 100 : 0}
        format={n => Number(n).toFixed(0) + '%'}
      />
      <MetricCard
        label="Average visit time"
        value={totaltime && pageviews ? totaltime / (pageviews - bounces) : 0}
        format={n => formatShortTime(n, ['m', 's'], ' ')}
      />
    </div>
  );
}
