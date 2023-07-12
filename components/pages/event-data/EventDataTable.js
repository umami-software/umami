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
      <GridColumn name="field" label={formatMessage(labels.field)}>
        {row => {
          return (
            <Link href={resolveUrl({ view: row.field })} shallow={true}>
              {row.field}
            </Link>
          );
        }}
      </GridColumn>
      <GridColumn name="total" label={formatMessage(labels.totalRecords)}>
        {({ total }) => total.toLocaleString()}
      </GridColumn>
    </GridTable>
  );
}

export default EventDataTable;
