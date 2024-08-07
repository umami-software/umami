import WebsiteDateFilter from 'components/input/WebsiteDateFilter';
import { Flexbox, Loading } from 'react-basics';
import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';
import useWebsiteStats from 'components/hooks/queries/useWebsiteStats';
import { formatLongNumber } from 'lib/format';

export function SessionsMetricsBar({ websiteId }: { websiteId: string }) {
  const { formatMessage, labels } = useMessages();
  const { data, isLoading } = useWebsiteStats(websiteId);

  return (
    <Flexbox direction="row" justifyContent="space-between" style={{ height: 120 }}>
      <Flexbox direction="row">
        {isLoading && <Loading icon="dots" />}
        {!isLoading && data && (
          <>
            <MetricCard
              value={data.visitors.value}
              label={formatMessage(labels.visitors)}
              formatValue={formatLongNumber}
            />
            <MetricCard
              value={data.visits.value}
              label={formatMessage(labels.visits)}
              formatValue={formatLongNumber}
            />
            <MetricCard
              value={data.pageviews.value}
              label={formatMessage(labels.views)}
              formatValue={formatLongNumber}
            />
            <MetricCard value={data?.countries?.value} label={formatMessage(labels.countries)} />
          </>
        )}
      </Flexbox>
      <WebsiteDateFilter websiteId={websiteId} />
    </Flexbox>
  );
}

export default SessionsMetricsBar;
