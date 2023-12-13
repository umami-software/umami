import { useContext } from 'react';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'components/hooks';
import { ReportContext } from '../[id]/Report';

export function EventDataTable() {
  const { report } = useContext(ReportContext);
  const { formatMessage, labels } = useMessages();

  return (
    <GridTable data={report?.data || []}>
      <GridColumn name="field" label={formatMessage(labels.field)} />
      <GridColumn name="value" label={formatMessage(labels.value)} />
      <GridColumn name="total" label={formatMessage(labels.total)} />
    </GridTable>
  );
}

export default EventDataTable;
