import { LoadingPanel } from '@/components/common/LoadingPanel';
import { useMessages } from '@/components/hooks';
import { useWebsiteSessionStatsQuery } from '@/components/hooks/queries/useWebsiteSessionStatsQuery';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatLongNumber } from '@/lib/format';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { t, labels } = useMessages();
  const { data, isLoading, isFetching, error } = useWebsiteSessionStatsQuery(websiteId);

  return (
    <LoadingPanel data={data} isLoading={isLoading} isFetching={isFetching} error={error}>
      {data && (
        <MetricsBar>
          <MetricCard
            value={data?.visitors?.value}
            label={t(labels.visitors)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.visits?.value}
            label={t(labels.visits)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.pageviews?.value}
            label={t(labels.views)}
            formatValue={formatLongNumber}
          />
          <MetricCard
            value={data?.countries?.value}
            label={t(labels.countries)}
            formatValue={formatLongNumber}
          />
        </MetricsBar>
      )}
    </LoadingPanel>
  );
}
