import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import Loading from 'components/common/Loading';
import ErrorMessage from 'components/common/ErrorMessage';
import useFetch from 'hooks/useFetch';
import useDateRange from 'hooks/useDateRange';
import usePageQuery from 'hooks/usePageQuery';
import useShareToken from 'hooks/useShareToken';
import { formatShortTime, formatNumber, formatLongNumber } from 'lib/format';
import { TOKEN_HEADER } from 'lib/constants';
import MetricCard from './MetricCard';
import styles from './MetricsBar.module.css';

export default function MetricsBar({ websiteId, className }) {
  const shareToken = useShareToken();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const [format, setFormat] = useState(true);
  const {
    query: { url },
  } = usePageQuery();

  const { data, error, loading } = useFetch(
    `/api/website/${websiteId}/stats`,
    {
      params: {
        start_at: +startDate,
        end_at: +endDate,
        url,
      },
      headers: { [TOKEN_HEADER]: shareToken?.token },
    },
    [url, modified],
  );

  const formatFunc = format ? formatLongNumber : formatNumber;

  function handleSetFormat() {
    setFormat(state => !state);
  }

  const { pageviews, uniques, bounces, totaltime } = data || {};
  const num = Math.min(uniques, bounces);

  return (
    <div className={classNames(styles.bar, className)} onClick={handleSetFormat}>
      {!data && loading && <Loading />}
      {error && <ErrorMessage />}
      {data && !error && (
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
            value={uniques ? (num / uniques) * 100 : 0}
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
