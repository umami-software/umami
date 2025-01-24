import classNames from 'classnames';
import { useDateRange, useMessages, useSticky } from 'components/hooks';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime, formatLongNumber } from 'lib/format';
import WebsiteFilterButton from './WebsiteFilterButton';
import useWebsiteStats from 'components/hooks/queries/useWebsiteStats';
import styles from './WebsiteMetricsBar.module.css';
import { Dropdown, Item } from 'react-basics';
import useStore, { setWebsiteDateCompare } from 'store/websites';

export function WebsiteMetricsBar({
  websiteId,
  sticky,
  showChange = false,
  compareMode = false,
  showFilter = false,
}: {
  websiteId: string;
  sticky?: boolean;
  showChange?: boolean;
  compareMode?: boolean;
  showFilter?: boolean;
}) {
  const { dateRange } = useDateRange(websiteId);
  const { formatMessage, labels } = useMessages();
  const dateCompare = useStore(state => state[websiteId]?.dateCompare);
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const { data, isLoading, isFetched, error } = useWebsiteStats(
    websiteId,
    compareMode && dateCompare,
  );
  const isAllTime = dateRange.value === 'all';

  const { pageviews, visitors, visits, bounces, totaltime } = data || {};

  const metrics = data
    ? [
        {
          ...pageviews,
          label: formatMessage(labels.views),
          change: pageviews.value - pageviews.prev,
          formatValue: formatLongNumber,
        },
        {
          ...visits,
          label: formatMessage(labels.visits),
          change: visits.value - visits.prev,
          formatValue: formatLongNumber,
        },
        {
          ...visitors,
          label: formatMessage(labels.visitors),
          change: visitors.value - visitors.prev,
          formatValue: formatLongNumber,
        },
        {
          label: formatMessage(labels.bounceRate),
          value: (Math.min(visits.value, bounces.value) / visits.value) * 100,
          prev: (Math.min(visits.prev, bounces.prev) / visits.prev) * 100,
          change:
            (Math.min(visits.value, bounces.value) / visits.value) * 100 -
            (Math.min(visits.prev, bounces.prev) / visits.prev) * 100,
          formatValue: n => Math.round(+n) + '%',
          reverseColors: true,
        },
        {
          label: formatMessage(labels.visitDuration),
          value: totaltime.value / visits.value,
          prev: totaltime.prev / visits.prev,
          change: totaltime.value / visits.value - totaltime.prev / visits.prev,
          formatValue: n =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
      ]
    : [];

  const items = [
    { label: formatMessage(labels.previousPeriod), value: 'prev' },
    { label: formatMessage(labels.previousYear), value: 'yoy' },
  ];

  return (
    <div
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: sticky && isSticky,
      })}
    >
      <div>
        <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
          {metrics.map(({ label, value, prev, change, formatValue, reverseColors }) => {
            return (
              <MetricCard
                key={label}
                value={value}
                previousValue={prev}
                label={label}
                change={change}
                formatValue={formatValue}
                reverseColors={reverseColors}
                showChange={!isAllTime && (compareMode || showChange)}
                showPrevious={!isAllTime && compareMode}
              />
            );
          })}
        </MetricsBar>
      </div>
      <div className={styles.actions}>
        {showFilter && <WebsiteFilterButton websiteId={websiteId} />}
        <WebsiteDateFilter websiteId={websiteId} showAllTime={!compareMode} />
        {compareMode && (
          <div className={styles.vs}>
            <b>VS</b>
            <Dropdown
              className={styles.dropdown}
              items={items}
              value={dateCompare || 'prev'}
              renderValue={value => items.find(i => i.value === value)?.label}
              alignment="end"
              onChange={(value: any) => setWebsiteDateCompare(websiteId, value)}
            >
              {items.map(({ label, value }) => (
                <Item key={value}>{label}</Item>
              ))}
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebsiteMetricsBar;
