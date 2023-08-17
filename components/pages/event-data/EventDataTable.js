import Link from 'next/link';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages, usePageQuery } from 'hooks';
import Empty from 'components/common/Empty';

export function EventDataTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { resolveUrl } = usePageQuery();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="event" label={formatMessage(labels.event)}>
        {row => (
          <Link href={resolveUrl({ event: row.event })} shallow={true}>
            {row.event}
          </Link>
        )}
      </GridColumn>
      <GridColumn name="field" label={formatMessage(labels.field)}>
        {row => row.field}
      </GridColumn>
      <GridColumn name="total" label={formatMessage(labels.totalRecords)}>
        {({ total }) => total.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default EventDataTable;
