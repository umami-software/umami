import { useDateRange, useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatShortTime, formatLongNumber } from '@/lib/format';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { useWebsites } from '@/store/websites';
import { LoadingPanel } from '@/components/common/LoadingPanel';

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
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery(
    websiteId,
    compareMode && dateCompare,
  );
  const isAllTime = dateRange.value === 'all';

  const { pageviews, visitors, visits, bounces, totaltime, previous } = data || {};

  const metrics = data
    ? [
        {
          value: visitors,
          label: formatMessage(labels.visitors),
          change: visitors - previous.visitors,
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: formatMessage(labels.visits),
          change: visits - previous.visits,
          formatValue: formatLongNumber,
        },
        {
          value: pageviews,
          label: formatMessage(labels.views),
          change: pageviews - previous.pageviews,
          formatValue: formatLongNumber,
        },
        {
          label: formatMessage(labels.bounceRate),
          value: (Math.min(visits, bounces) / visits) * 100,
          prev: (Math.min(previous.visits, previous.bounces) / previous.visits) * 100,
          change:
            (Math.min(visits, bounces) / visits) * 100 -
            (Math.min(previous.visits, previous.bounces) / previous.visits) * 100,
          formatValue: n => Math.round(+n) + '%',
          reverseColors: true,
        },
        {
          label: formatMessage(labels.visitDuration),
          value: totaltime / visits,
          prev: previous.totaltime / previous.visits,
          change: totaltime / visits - previous.totaltime / previous.visits,
          formatValue: n =>
            `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`,
        },
      ]
    : null;

  return (
    <LoadingPanel
      data={metrics}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      minHeight="136px"
    >
      <MetricsBar>
        {metrics?.map(({ label, value, prev, change, formatValue, reverseColors }) => {
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
    </LoadingPanel>
  );
}
