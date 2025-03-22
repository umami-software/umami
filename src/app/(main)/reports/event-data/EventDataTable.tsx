import { useContext } from 'react';
import { DataTable, DataColumn } from '@umami/react-zen';
import { useMessages } from '@/components/hooks';
import { ReportContext } from '../[reportId]/Report';

export function EventDataTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={report?.data || []}>
      <DataColumn id="field" label={formatMessage(labels.field)} />
      <DataColumn id="value" label={formatMessage(labels.value)} />
      <DataColumn id="total" label={formatMessage(labels.total)} />
    </DataTable>
  );
}
