import { GridTable, GridColumn } from 'react-basics';
import { useMessages } from 'components/hooks';
import PageHeader from 'components/layout/PageHeader';
import Empty from 'components/common/Empty';
import { DATA_TYPES } from 'lib/constants';

export function EventDataValueTable({ data = [], event }: { data: any[]; event: string }) {
  const { formatMessage, labels } = useMessages();

  return (
    <>
      <PageHeader title={event} />
      {data.length <= 0 && <Empty />}
      {data.length > 0 && (
        <GridTable data={data}>
          <GridColumn name="fieldName" label={formatMessage(labels.field)} />
          <GridColumn name="dataType" label={formatMessage(labels.type)}>
            {row => DATA_TYPES[row.dataType]}
          </GridColumn>
          <GridColumn name="fieldValue" label={formatMessage(labels.value)} />
          <GridColumn name="total" label={formatMessage(labels.totalRecords)} width="200px">
            {({ total }) => total.toLocaleString()}
          </GridColumn>
        </GridTable>
      )}
    </>
  );
}

export default EventDataValueTable;
