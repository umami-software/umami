import MetricCard from '@/components/metrics/MetricCard';
import { useMessages } from '@/components/hooks';
import { RealtimeData } from '@/lib/types';
import styles from './RealtimeHeader.module.css';

export function RealtimeHeader({ data }: { data: RealtimeData }) {
  const { formatMessage, labels } = useMessages();
  const { totals }: any = data || {};

  return (
    <div className={styles.header}>
      <div className={styles.metrics}>
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.views)}
          value={totals.views}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.visitors)}
          value={totals.visitors}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.events)}
          value={totals.events}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.countries)}
          value={totals.countries}
        />
      </div>
    </div>
  );
}

export default RealtimeHeader;
