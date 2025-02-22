import { useMessages } from '@/components/hooks';
import MetricCard from '@/components/metrics/MetricCard';
import MetricsBar from '@/components/metrics/MetricsBar';
import { formatShortTime } from '@/lib/format';

export function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();

  return (
    <MetricsBar isFetched={true}>
      <MetricCard label={formatMessage(labels.visits)} value={data?.visits} />
      <MetricCard label={formatMessage(labels.views)} value={data?.views} />
      <MetricCard label={formatMessage(labels.events)} value={data?.events} />
      <MetricCard
        label={formatMessage(labels.visitDuration)}
        value={data?.totaltime / data?.visits}
        formatValue={n => `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`}
      />
    </MetricsBar>
  );
}
