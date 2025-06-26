import { useMessages } from '@/components/hooks';
import useWebsiteSessionStats from '@/components/hooks/queries/useWebsiteSessionStats';
import MetricCard from '@/components/metrics/MetricCard';
import MetricsBar from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteSessionStats(websiteId);

  return (
    <MetricsBar isLoading={isLoading} isFetched={isFetched} error={error}>
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
        value={data?.countries?.value}
        label={formatMessage(labels.countries)}
        formatValue={formatLongNumber}
      />
    </MetricsBar>
  );
}

export default SessionsMetricsBar;
