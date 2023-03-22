import MetricCard from 'components/metrics/MetricCard';
import useMessages from 'hooks/useMessages';
import styles from './RealtimeHeader.module.css';

export default function RealtimeHeader({ data = {} }) {
  const { formatMessage, labels } = useMessages();
  const { pageviews, visitors, events, countries } = data;

  return (
    <div className={styles.header}>
      <div className={styles.metrics}>
        <MetricCard label={formatMessage(labels.views)} value={pageviews?.length} hideComparison />
        <MetricCard
          label={formatMessage(labels.visitors)}
          value={visitors?.length}
          hideComparison
        />
        <MetricCard label={formatMessage(labels.events)} value={events?.length} hideComparison />
        <MetricCard
          label={formatMessage(labels.countries)}
          value={countries?.length}
          hideComparison
        />
      </div>
    </div>
  );
}
