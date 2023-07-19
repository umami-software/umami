import Link from 'next/link';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages, usePageQuery } from 'hooks';
import Empty from 'components/common/Empty';

export function EventDataTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { resolveUrl } = usePageQuery();

  function linkToView(row, cell) {
    return (
      <Link href={resolveUrl({ view: row.field, event: row.event })} shallow={true}>
        {cell}
      </Link>
    );
  }

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="event" label={formatMessage(labels.event)}>
        {row => linkToView(row, row.event)}
      </GridColumn>
      <GridColumn name="field" label={formatMessage(labels.field)}>
        {row => linkToView(row, row.field)}
      </GridColumn>
      <GridColumn name="total" label={formatMessage(labels.totalRecords)}>
        {({ total }) => total.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default EventDataTable;
