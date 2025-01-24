import MetricsTable, { MetricsTableProps } from './MetricsTable';
import { useMessages } from 'components/hooks';

export function ScreenTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.screens)}
      type="screen"
      metric={formatMessage(labels.visitors)}
    />
  );
}

export default ScreenTable;
