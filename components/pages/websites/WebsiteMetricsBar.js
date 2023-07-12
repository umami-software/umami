import classNames from 'classnames';
import { Row, Column } from 'react-basics';
import { formatShortTime } from 'lib/format';
import MetricCard from 'components/metrics/MetricCard';
import RefreshButton from 'components/input/RefreshButton';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricsBar from 'components/metrics/MetricsBar';
import { useApi, useDateRange, usePageQuery, useMessages, useSticky } from 'hooks';
import styles from './WebsiteMetricsBar.module.css';

export function WebsiteMetricsBar({ websiteId, sticky }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const {
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = usePageQuery();

  const { data, error, isLoading, isFetched } = useQuery(
    [
      'websites:stats',
      { websiteId, modified, url, referrer, title, os, browser, device, country, region, city },
    ],
    () =>
      get(`/websites/${websiteId}/stats`, {
        startAt: +startDate,
        endAt: +endDate,
        url,
        referrer,
        title,
        os,
        browser,
        device,
        country,
        region,
        city,
      }),
  );

  const { pageviews, uniques, bounces, totaltime } = data || {};
  const num = Math.min(data && uniques.value, data && bounces.value);
  const diffs = data && {
    pageviews: pageviews.value - pageviews.change,
    uniques: uniques.value - uniques.change,
    bounces: bounces.value - bounces.change,
    totaltime: totaltime.value - totaltime.change,
  };

  return (
    <Row
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: isSticky,
      })}
    >
      <Column defaultSize={12} xl={8}>
        <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
          {!error && isFetched && (
            <>
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.views)}
                value={pageviews.value}
                change={pageviews.change}
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.visitors)}
                value={uniques.value}
                change={uniques.change}
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.bounceRate)}
                value={uniques.value ? (num / uniques.value) * 100 : 0}
                change={
                  uniques.value && uniques.change
                    ? (num / uniques.value) * 100 -
                        (Math.min(diffs.uniques, diffs.bounces) / diffs.uniques) * 100 || 0
                    : 0
                }
                format={n => Number(n).toFixed(0) + '%'}
                reverseColors
              />
              <MetricCard
                className={styles.card}
                label={formatMessage(labels.averageVisitTime)}
                value={
                  totaltime.value && pageviews.value
                    ? totaltime.value / (pageviews.value - bounces.value)
                    : 0
                }
                change={
                  totaltime.value && pageviews.value
                    ? (diffs.totaltime / (diffs.pageviews - diffs.bounces) -
                        totaltime.value / (pageviews.value - bounces.value)) *
                        -1 || 0
                    : 0
                }
                format={n =>
                  `${n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`
                }
              />
            </>
          )}
        </MetricsBar>
      </Column>
      <Column defaultSize={12} xl={4}>
        <div className={styles.actions}>
          <RefreshButton websiteId={websiteId} />
          <WebsiteDateFilter websiteId={websiteId} />
        </div>
      </Column>
    </Row>
  );
}

export default WebsiteMetricsBar;
