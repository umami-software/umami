import MetricsTable, { MetricsTableProps } from '@/components/metrics/MetricsTable';
import { useMessages } from '@/components/hooks';

export function BrowsersTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.channels)}
      type="channel"
      metric={formatMessage(labels.visitors)}
    />
  );
}

export default BrowsersTable;
