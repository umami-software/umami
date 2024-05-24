import classNames from 'classnames';
import { useMessages, useSticky } from 'components/hooks';
import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime } from 'lib/format';
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
}: {
  websiteId: string;
  sticky?: boolean;
  showChange?: boolean;
  compareMode?: boolean;
}) {
  const { formatMessage, labels } = useMessages();
  const dateCompare = useStore(state => state[websiteId]?.dateCompare);
  const { ref, isSticky } = useSticky({ enabled: sticky });
  const { data, isLoading, isFetched, error } = useWebsiteStats(
    websiteId,
    compareMode && dateCompare,
  );

  const { pageviews, visitors, visits, bounces, totaltime } = data || {};

  const metrics = data
    ? [
        {
          ...pageviews,
          label: formatMessage(labels.views),
          change: pageviews.value - pageviews.prev,
        },
        {
          ...visits,
          label: formatMessage(labels.visits),
          change: visits.value - visits.prev,
        },
        {
          ...visitors,
          label: formatMessage(labels.visitors),
          change: visitors.value - visitors.prev,
        },
        {
          label: formatMessage(labels.bounceRate),
          value: (Math.min(visitors.value, bounces.value) / visitors.value) * 100,
          prev: (Math.min(visitors.prev, bounces.prev) / visitors.prev) * 100,
          change:
            (Math.min(visitors.value, bounces.value) / visitors.value) * 100 -
            (Math.min(visitors.prev, bounces.prev) / visitors.prev) * 100,
          format: n => Number(n).toFixed(0) + '%',
          reverseColors: true,
        },
        {
          label: formatMessage(labels.visitDuration),
          value: totaltime.value / visits.value,
          prev: totaltime.prev / visits.prev,
          change: totaltime.value / visits.value - totaltime.prev / visits.prev,
          format: n => `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
      ]
    : [];

  const items = [
    { label: formatMessage(labels.previousPeriod), value: 'prev' },
    { label: formatMessage(labels.yearOverYear), value: 'yoy' },
  ];

  return (
    <div
      ref={ref}
      className={classNames(styles.container, {
        [styles.sticky]: sticky,
        [styles.isSticky]: isSticky,
      })}
    >
      <div>
        <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
          {metrics.map(({ label, value, prev, change, format, reverseColors }) => {
            return (
              <MetricCard
                key={label}
                value={value}
                previousValue={prev}
                label={label}
                change={change}
                format={format}
                reverseColors={reverseColors}
                showChange={compareMode || showChange}
                showPrevious={compareMode}
              />
            );
          })}
        </MetricsBar>
      </div>
      <div className={styles.actions}>
        <WebsiteFilterButton websiteId={websiteId} />
        <WebsiteDateFilter websiteId={websiteId} />
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
