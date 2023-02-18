import { useIntl } from 'react-intl';
import MetricCard from 'components/metrics/MetricCard';
import { labels } from 'components/messages';
import styles from './RealtimeHeader.module.css';

export default function RealtimeHeader({ data = {} }) {
  const { formatMessage } = useIntl();
  const { pageviews, sessions, events, countries } = data;

  const visitors = sessions?.reduce((arr, { sessionId }) => {
    if (sessionId && !arr.includes(sessionId)) {
      return arr.concat(sessionId);
    }
    return arr;
  }, []);

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
