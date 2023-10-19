import classNames from 'classnames';
import { useApi, useDateRange, useMessages, useNavigation, useSticky } from 'components/hooks';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime } from 'lib/format';
import WebsiteFilterButton from './WebsiteFilterButton';
import styles from './WebsiteMetricsBar.module.css';

export function WebsiteMetricsBar({ websiteId, showFilter = true, sticky }) {
  const { formatMessage, labels } = useMessages();
  const { get, useQuery } = useApi();
  const [dateRange] = useDateRange(websiteId);
  const { startDate, endDate, modified } = dateRange;
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const {
    query: { url, referrer, title, os, browser, device, country, region, city },
  } = useNavigation();

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
    <div
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: isSticky,
      })}
    >
      <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
        {pageviews && uniques && (
          <>
            <MetricCard
              label={formatMessage(labels.views)}
              value={pageviews.value}
              change={pageviews.change}
            />
            <MetricCard
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
              format={n => `${n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`}
            />
          </>
        )}
      </MetricsBar>
      <div className={styles.actions}>
        {showFilter && <WebsiteFilterButton websiteId={websiteId} className={styles.button} />}
        <WebsiteDateFilter websiteId={websiteId} />
      </div>
    </div>
  );
}

export default WebsiteMetricsBar;
