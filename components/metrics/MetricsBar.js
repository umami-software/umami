import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import MetricCard from './MetricCard';
import { get } from 'lib/web';
import { formatShortTime, formatNumber, formatLongNumber } from 'lib/format';
import styles from './MetricsBar.module.css';

export default function MetricsBar({ websiteId, startDate, endDate, className }) {
  const [data, setData] = useState({});
  const [format, setFormat] = useState(true);
  const { pageviews, uniques, bounces, totaltime } = data;

  const formatFunc = format ? formatLongNumber : formatNumber;

  async function loadData() {
    setData(
      await get(`/api/website/${websiteId}/metrics`, {
        start_at: +startDate,
        end_at: +endDate,
      }),
    );
  }

  function handleSetFormat() {
    setFormat(state => !state);
  }

  useEffect(() => {
    loadData();
  }, [websiteId, startDate, endDate]);

  return (
    <div className={classNames(styles.bar, className)} onClick={handleSetFormat}>
      <MetricCard label="Views" value={pageviews} format={formatFunc} />
      <MetricCard label="Visitors" value={uniques} format={formatFunc} />
      <MetricCard
        label="Bounce rate"
        value={pageviews ? (bounces / pageviews) * 100 : 0}
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
