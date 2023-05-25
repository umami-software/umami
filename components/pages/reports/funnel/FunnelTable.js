import DataTable from 'components/metrics/DataTable';
import { useMessages } from 'hooks';

export function FunnelTable({ data }) {
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable
      data={data}
      title={formatMessage(labels.url)}
      metric={formatMessage(labels.visitors)}
      showPercentage={false}
    />
  );
}

export default FunnelTable;
