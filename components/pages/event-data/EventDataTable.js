import Link from 'next/link';
import { GridTable, GridColumn } from 'react-basics';
import { useMessages, usePageQuery } from 'hooks';
import Empty from 'components/common/Empty';
import { DATA_TYPES } from 'lib/constants';

export function EventDataTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { resolveUrl } = usePageQuery();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <GridTable data={data}>
      <GridColumn name="eventName" label={formatMessage(labels.event)}>
        {row => (
          <Link href={resolveUrl({ event: row.eventName })} shallow={true}>
            {row.eventName}
          </Link>
        )}
      </GridColumn>
      <GridColumn name="fieldName" label={formatMessage(labels.field)}>
        {row => row.fieldName}
      </GridColumn>
      <GridColumn name="dataType" label={formatMessage(labels.type)}>
        {row => DATA_TYPES[row.dataType]}
      </GridColumn>
      <GridColumn name="total" label={formatMessage(labels.totalRecords)}>
        {({ total }) => total.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default EventDataTable;
