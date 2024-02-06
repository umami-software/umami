import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';
import { RealtimeData } from 'lib/types';
import styles from './RealtimeHeader.module.css';

export function RealtimeHeader({ data }: { data: RealtimeData }) {
  const { formatMessage, labels } = useMessages();
  const { pageviews, visitors, events, countries } = data || {};

  return (
    <div className={styles.header}>
      <div className={styles.metrics}>
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.views)}
          value={pageviews?.length}
          hideComparison
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.visitors)}
          value={visitors?.length}
          hideComparison
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.events)}
          value={events?.length}
          hideComparison
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.countries)}
          value={countries?.length}
          hideComparison
        />
      </div>
    </div>
  );
}

export default RealtimeHeader;
