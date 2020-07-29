import React from 'react';
import MetricCard from './MetricCard';
import styles from './WebsiteSummary.module.css';

function getTotal(data) {
  return data.reduce((n, v) => n + v.y, 0);
}

export default function WebsiteSummary({ data }) {
  return (
    <div className={styles.container}>
      <MetricCard label="Views" value={getTotal(data.pageviews)} />
      <MetricCard label="Visitors" value={getTotal(data.uniques)} />
    </div>
  );
}
