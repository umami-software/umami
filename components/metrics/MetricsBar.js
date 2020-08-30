import React, { useState } from 'react';
import classNames from 'classnames';
import MetricCard from './MetricCard';
import { formatShortTime, formatNumber, formatLongNumber } from 'lib/format';
import useFetch from 'hooks/useFetch';
import styles from './MetricsBar.module.css';

export default function MetricsBar({ websiteId, startDate, endDate, className }) {
  const { data } = useFetch(`/api/website/${websiteId}/metrics`, {
    start_at: +startDate,
    end_at: +endDate,
  });
  const [format, setFormat] = useState(true);

  const formatFunc = format ? formatLongNumber : formatNumber;

  function handleSetFormat() {
    setFormat(state => !state);
  }

  if (!data) {
    return null;
  }

  const { pageviews, uniques, bounces, totaltime } = data;

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
