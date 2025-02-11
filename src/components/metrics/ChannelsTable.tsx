import MetricsTable, { MetricsTableProps } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';

export function ChannelsTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  const renderLabel = ({ x }) => {
    return formatMessage(labels[x]);
  };

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.channels)}
      type="channel"
      renderLabel={renderLabel}
      metric={formatMessage(labels.visitors)}
    />
  );
}

export default ChannelsTable;
