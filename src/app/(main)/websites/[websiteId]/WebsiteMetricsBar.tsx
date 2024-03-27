import classNames from 'classnames';
import { useMessages, useSticky } from 'components/hooks';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime } from 'lib/format';
import WebsiteFilterButton from './WebsiteFilterButton';
import styles from './WebsiteMetricsBar.module.css';
import useWebsiteStats from 'components/hooks/queries/useWebsiteStats';

export function WebsiteMetricsBar({
  websiteId,
  showFilter = true,
  sticky,
}: {
  websiteId: string;
  showFilter?: boolean;
  sticky?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const { data, isLoading, isFetched, error } = useWebsiteStats(websiteId);

  const { views, visitors, visits, bounces, totaltime } = data || {};
  const num = Math.min(data && visitors.value, data && bounces.value);
  const diffs = data && {
    views: views.value - views.change,
    visitors: visitors.value - visitors.change,
    visits: visits.value - visits.change,
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
        {views && visitors && (
          <>
            <MetricCard
              label={formatMessage(labels.views)}
              value={views.value}
              change={views.change}
            />
            <MetricCard
              label={formatMessage(labels.visitors)}
              value={visitors.value}
              change={visitors.change}
            />
            <MetricCard
              label={formatMessage(labels.visits)}
              value={visits.value}
              change={visits.change}
            />
            <MetricCard
              label={formatMessage(labels.viewsPerVisit)}
              value={visits.value ? views.value / visits.value : 0}
              change={
                visits.value && visits.change
                  ? views.value / visits.value - diffs.views / diffs.visits
                  : 0
              }
            />
            <MetricCard
              label={formatMessage(labels.bounceRate)}
              value={visitors.value ? (num / visitors.value) * 100 : 0}
              change={
                visitors.value && visitors.change
                  ? (num / visitors.value) * 100 -
                      (Math.min(diffs.visitors, diffs.bounces) / diffs.visitors) * 100 || 0
                  : 0
              }
              format={n => Number(n).toFixed(0) + '%'}
              reverseColors
            />
            <MetricCard
              label={formatMessage(labels.averageVisitTime)}
              value={
                totaltime.value && views.value ? totaltime.value / (views.value - bounces.value) : 0
              }
              change={
                totaltime.value && views.value
                  ? (diffs.totaltime / (diffs.views - diffs.bounces) -
                      totaltime.value / (views.value - bounces.value)) *
                      -1 || 0
                  : 0
              }
              format={n => `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`}
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
