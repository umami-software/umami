import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';
import MetricsBar from 'components/metrics/MetricsBar';

export function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();

  return (
    <MetricsBar isFetched={true}>
      <MetricCard label={formatMessage(labels.visits)} value={data?.visits} />
      <MetricCard label={formatMessage(labels.views)} value={data?.views} />
      <MetricCard label={formatMessage(labels.events)} value={data?.events} />
    </MetricsBar>
  );
}
