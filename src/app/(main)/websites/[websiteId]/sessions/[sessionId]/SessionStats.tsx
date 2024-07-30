import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';

export default function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <MetricCard label={formatMessage(labels.visits)} value={data?.visits} />
      <MetricCard label={formatMessage(labels.views)} value={data?.views} />
      <MetricCard label={formatMessage(labels.events)} value={data?.events} />
    </>
  );
}
