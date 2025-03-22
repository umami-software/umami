import { useMessages } from '@/components/hooks';
import { useWebsiteSessionStatsQuery } from '@/components/hooks/queries/useWebsiteSessionStatsQuery';
import { WebsiteDateFilter } from '@/components/input/WebsiteDateFilter';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';
import { Flexbox } from '@umami/react-zen';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteSessionStatsQuery(websiteId);

  return (
    <Flexbox direction="row" justifyContent="space-between" style={{ minHeight: 120 }}>
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
      <WebsiteDateFilter websiteId={websiteId} />
    </Flexbox>
  );
}
