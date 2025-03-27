import { useDateRange, useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatShortTime, formatLongNumber } from '@/lib/format';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { useWebsites } from '@/store/websites';

export function WebsiteMetricsBar({
  websiteId,
  showChange = false,
  compareMode = false,
}: {
  websiteId: string;
  showChange?: boolean;
  compareMode?: boolean;
  showFilter?: boolean;
}) {
  const { dateRange } = useDateRange(websiteId);
  const { formatMessage, labels } = useMessages();
  const dateCompare = useWebsites(state => state[websiteId]?.dateCompare);
  const { data, isLoading, isFetched, error } = useWebsiteStatsQuery(
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

  return (
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
  );
}
