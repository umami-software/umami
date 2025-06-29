import { useMessages } from '@/components/hooks';
import { useWebsiteSessionStatsQuery } from '@/components/hooks/queries/useWebsiteSessionStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { LoadingPanel } from '@/components/common/LoadingPanel';

export function EventsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteSessionStatsQuery(websiteId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <MetricsBar>
          <MetricCard
            value={data?.visitors?.value}
            label={formatMessage(labels.visitors)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.visits?.value}
            label={formatMessage(labels.visits)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.pageviews?.value}
            label={formatMessage(labels.views)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.events?.value}
            label={formatMessage(labels.events)}
            formatValue={formatLongNumber}
          />
        </MetricsBar>
      )}
    </LoadingPanel>
  );
}
