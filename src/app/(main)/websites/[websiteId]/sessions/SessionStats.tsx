import { useMessages } from '@/components/hooks';
import { MetricCard } from '@/components/metrics/MetricCard';
import { MetricsBar } from '@/components/metrics/MetricsBar';
import { formatShortTime } from '@/lib/format';

export function SessionStats({ data }) {
  const { t, labels } = useMessages();
  const visits = Number(data?.visits ?? 0);
  const views = Number(data?.views ?? 0);
  const events = Number(data?.events ?? 0);
  const totaltime = Number(data?.totaltime ?? 0);
  const avgDuration = visits > 0 ? totaltime / visits : 0;

  return (
    <MetricsBar>
      <MetricCard label={t(labels.visits)} value={visits} muted={visits === 0} />
      <MetricCard label={t(labels.views)} value={views} muted={views === 0} />
      <MetricCard label={t(labels.events)} value={events} muted={events === 0} />
      <MetricCard
        label={t(labels.visitDuration)}
        value={avgDuration}
        muted={avgDuration === 0}
        tooltip={avgDuration === 0 ? 'Single-page visit or duration under 1s' : undefined}
        formatValue={n =>
          avgDuration === 0
            ? '—'
            : `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), ['m', 's'], ' ')}`
        }
      />
    </MetricsBar>
  );
}
