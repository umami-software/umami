import { useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';

export function RealtimeHeader({ data }: { data: any }) {
  const { t, labels } = useMessages();
  const { totals }: any = data || {};

  return (
    <MetricsBar>
      <MetricCard label={t(labels.views)} value={totals.views} />
      <MetricCard label={t(labels.visitors)} value={totals.visitors} />
      <MetricCard label={t(labels.events)} value={totals.events} />
      <MetricCard label={t(labels.countries)} value={totals.countries} />
    </MetricsBar>
  );
}
