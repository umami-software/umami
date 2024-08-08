import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import { Flexbox } from 'react-basics';
import MetricsBar from 'components/metrics/MetricsBar';
import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';
import useWebsiteStats from 'components/hooks/queries/useWebsiteStats';
import { formatLongNumber } from 'lib/format';

export function EventsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading, isFetched, error } = useWebsiteStats(websiteId);

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
          value={data?.events?.value}
          label={formatMessage(labels.events)}
          formatValue={formatLongNumber}
        />
      </MetricsBar>
      <WebsiteDateFilter websiteId={websiteId} />
    </Flexbox>
  );
}

export default EventsMetricsBar;
