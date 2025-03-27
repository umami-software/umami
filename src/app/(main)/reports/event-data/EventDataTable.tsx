import { DataTable, DataColumn } from '@umami/react-zen';
import { useMessages, useReport } from '@/components/hooks';

export function EventDataTable() {
  const { report } = useReport();
  const { formatMessage, labels } = useMessages();

  return (
    <DataTable data={report?.data || []}>
      <DataColumn id="field" label={formatMessage(labels.field)} />
      <DataColumn id="value" label={formatMessage(labels.value)} />
      <DataColumn id="total" label={formatMessage(labels.total)} />
    </DataTable>
  );
}
