import MetricCard from 'components/metrics/MetricCard';
import { useMessages } from 'components/hooks';
import { RealtimeData } from 'lib/types';
import styles from './RealtimeHeader.module.css';
import { useIntl } from 'react-intl';
import { formatLongNumberOptions } from 'lib/format';

export function RealtimeHeader({ data }: { data: RealtimeData }) {
  const { formatMessage, labels } = useMessages();
  const { totals }: any = data || {};
  const intl = useIntl();

  return (
    <div className={styles.header}>
      <div className={styles.metrics}>
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.views)}
          value={totals.views}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.visitors)}
          value={totals.visitors}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.events)}
          value={totals.events}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
        <MetricCard
          className={styles.card}
          label={formatMessage(labels.countries)}
          value={totals.countries}
          formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
        />
      </div>
    </div>
  );
}

export default RealtimeHeader;
