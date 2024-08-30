import { useMessages } from 'components/hooks';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatLongNumberOptions, formatShortTime } from 'lib/format';
import { useIntl } from 'react-intl';

export function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();
  const intl = useIntl();

  return (
    <MetricsBar isFetched={true}>
      <MetricCard
        label={formatMessage(labels.visits)}
        value={data?.visits}
        formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
      />
      <MetricCard
        label={formatMessage(labels.views)}
        value={data?.views}
        formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
      />
      <MetricCard
        label={formatMessage(labels.events)}
        value={data?.events}
        formatValue={(n: number) => intl.formatNumber(n, formatLongNumberOptions(n))}
      />
      <MetricCard
        label={formatMessage(labels.visitDuration)}
        value={data?.totaltime / data?.visits}
        formatValue={n =>
          `${+n < 0 ? '-' : ''}${formatShortTime(intl, { formatMessage, labels }, Math.abs(~~n))}`
        }
      />
    </MetricsBar>
  );
}
