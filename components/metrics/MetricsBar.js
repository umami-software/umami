import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Loading from 'components/common/Loading';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import { formatShortTime, formatNumber, formatLongNumber } from 'lib/format';
import usePageQuery from 'hooks/usePageQuery';
import MetricCard from './MetricCard';
import styles from './MetricsBar.module.css';

export default function MetricsBar({ websiteId, token, className }) {
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const [format, setFormat] = useState(true);
  const {
    query: { url },
  } = usePageQuery();

  const { data } = useFetch(
    `/api/website/${websiteId}/metrics`,
    {
      start_at: +startDate,
      end_at: +endDate,
      url,
      token,
    },
    {
      update: [modified],
    },
  );

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
          <MetricCard
            label={<FormattedMessage id="metrics.views" defaultMessage="Views" />}
            value={pageviews}
            format={formatFunc}
          />
          <MetricCard
            label={<FormattedMessage id="metrics.visitors" defaultMessage="Visitors" />}
            value={uniques}
            format={formatFunc}
          />
          <MetricCard
            label={<FormattedMessage id="metrics.bounce-rate" defaultMessage="Bounce rate" />}
            value={pageviews ? (bounces / pageviews) * 100 : 0}
            format={n => Number(n).toFixed(0) + '%'}
          />
          <MetricCard
            label={
              <FormattedMessage
                id="metrics.average-visit-time"
                defaultMessage="Average visit time"
              />
            }
            value={totaltime && pageviews ? totaltime / (pageviews - bounces) : 0}
            format={n => formatShortTime(n, ['m', 's'], ' ')}
          />
        </>
      )}
    </div>
  );
}
