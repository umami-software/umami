import MetricsTable from './MetricsTable';
import useMessages from 'hooks/useMessages';

export function ScreenTable({ websiteId, ...props }) {
  const { formatMessage, labels } = useMessages();

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.screens)}
      type="screen"
      metric={formatMessage(labels.visitors)}
      websiteId={websiteId}
    />
  );
}

export default ScreenTable;
