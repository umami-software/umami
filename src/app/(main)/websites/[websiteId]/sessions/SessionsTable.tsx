import { GridColumn, GridTable, useBreakpoint } from 'react-basics';
import { useMessages } from 'components/hooks';

export function SessionsTable({ data = [] }: { data: any[]; showDomain?: boolean }) {
  const { formatMessage, labels } = useMessages();
  const breakpoint = useBreakpoint();

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="id" label="ID" />
      <GridColumn name="country" label={formatMessage(labels.country)} />
      <GridColumn name="city" label={formatMessage(labels.city)} />
      <GridColumn name="browser" label={formatMessage(labels.browser)} />
      <GridColumn name="os" label={formatMessage(labels.os)} />
      <GridColumn name="device" label={formatMessage(labels.device)} />
      <GridColumn name="createdAt" label={formatMessage(labels.created)} />
    </GridTable>
  );
}

export default SessionsTable;
