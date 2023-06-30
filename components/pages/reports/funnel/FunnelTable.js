import { useContext } from 'react';
import DataTable from 'components/metrics/DataTable';
import { useMessages } from 'hooks';
import { ReportContext } from '../Report';

export function FunnelTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable
      data={report?.data}
      title={formatMessage(labels.url)}
      metric={formatMessage(labels.visitors)}
      showPercentage={false}
    />
  );
}

export default FunnelTable;
