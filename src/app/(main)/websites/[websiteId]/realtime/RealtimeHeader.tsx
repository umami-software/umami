import { MetricCard } from '@/components/metrics/MetricCard';
import { useMessages } from '@/components/hooks';
import { RealtimeData } from '@/lib/types';
import { MetricsBar } from '@/components/metrics/MetricsBar';

export function RealtimeHeader({ data }: { data: RealtimeData }) {
  const { formatMessage, labels } = useMessages();
  const { totals }: any = data || {};

  return (
    <MetricsBar isFetched={true}>
      <MetricCard label={formatMessage(labels.views)} value={totals.views} />
      <MetricCard label={formatMessage(labels.visitors)} value={totals.visitors} />
      <MetricCard label={formatMessage(labels.events)} value={totals.events} />
      <MetricCard label={formatMessage(labels.countries)} value={totals.countries} />
    </MetricsBar>
  );
}
