import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'hooks';

export function EventDataTable({ data = [], showValue }) {
  const { formatMessage, labels } = useMessages();

  return (
    <GridTable data={data}>
      <GridColumn name="field" label={formatMessage(labels.field)} />
      <GridColumn name="value" label={formatMessage(labels.value)} hidden={!showValue} />
      <GridColumn name="total" label={formatMessage(labels.total)}>
        {({ total }) => total.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default EventDataTable;
