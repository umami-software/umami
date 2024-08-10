import { useMessages } from 'components/hooks';
import MetricCard from 'components/metrics/MetricCard';
import MetricsBar from 'components/metrics/MetricsBar';
import { formatShortTime } from 'lib/format';

export function SessionStats({ data }) {
  const { formatMessage, labels } = useMessages();
  const duration = (new Date(data?.lastAt).getTime() - new Date(data?.firstAt).getTime()) / 1000;
  let dateFormat;

  if (duration > 86400) {
    dateFormat = ['d', 'm'];
  } else if (duration > 3600) {
    dateFormat = ['h', 'm'];
  } else {
    dateFormat = ['m', 's'];
  }

  return (
    <MetricsBar isFetched={true}>
      <MetricCard label={formatMessage(labels.visits)} value={data?.visits} />
      <MetricCard label={formatMessage(labels.views)} value={data?.views} />
      <MetricCard label={formatMessage(labels.events)} value={data?.events} />
      <MetricCard
        label={formatMessage(labels.sessionDuration)}
        value={duration}
        formatValue={n => `${+n < 0 ? '-' : ''}${formatShortTime(Math.abs(~~n), dateFormat, ' ')}`}
      />
    </MetricsBar>
  );
}
