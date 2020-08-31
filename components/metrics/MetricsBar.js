import React, { useState } from 'react';
import classNames from 'classnames';
import MetricCard from './MetricCard';
import Loading from 'components/common/Loading';
import useFetch from 'hooks/useFetch';
import { formatShortTime, formatNumber, formatLongNumber } from 'lib/format';
import styles from './MetricsBar.module.css';
import { useSelector } from 'react-redux';
import { getDateRange } from '../../lib/date';

export default function MetricsBar({ websiteId, className, defaultDateRange = '7day' }) {
  const dateRange = useSelector(state => state.websites[websiteId]?.dateRange);
  const { startDate, endDate, modified } = dateRange || getDateRange(defaultDateRange);
  const { data } = useFetch(
    `/api/website/${websiteId}/metrics`,
    {
      start_at: +startDate,
      end_at: +endDate,
    },
    {
      update: [modified],
    },
  );
  const [format, setFormat] = useState(true);

  const formatFunc = format ? formatLongNumber : formatNumber;

  function handleSetFormat() {
    setFormat(state => !state);
  }

  const { pageviews, uniques, bounces, totaltime } = data || {};

  return (
    <div className={classNames(styles.bar, className)} onClick={handleSetFormat}>
      {!data ? (
        <Loading />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
