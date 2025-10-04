import { useDateRange, useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { useWebsiteStatsQuery } from '@/components/hooks/queries/useWebsiteStatsQuery';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export function LinkMetricsBar({
  linkId,
}: {
  linkId: string;
  showChange?: boolean;
  compareMode?: boolean;
}) {
  const { isAllTime } = useDateRange();
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteStatsQuery(linkId);

  const { pageviews, visitors, visits, comparison } = data || {};

  const metrics = data
    ? [
        {
          value: visitors,
          label: formatMessage(labels.visitors),
          change: visitors - comparison.visitors,
          formatValue: formatLongNumber,
        },
        {
          value: visits,
          label: formatMessage(labels.visits),
          change: visits - comparison.visits,
          formatValue: formatLongNumber,
        },
        {
          value: pageviews,
          label: formatMessage(labels.views),
          change: pageviews - comparison.pageviews,
          formatValue: formatLongNumber,
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
        {metrics?.map(({ label, value, prev, change, formatValue, reverseColors }: any) => {
          return (
            <MetricCard
              key={label}
              value={value}
              previousValue={prev}
              label={label}
              change={change}
              formatValue={formatValue}
              reverseColors={reverseColors}
              showChange={!isAllTime}
            />
          );
        })}
      </MetricsBar>
    </LoadingPanel>
  );
}
