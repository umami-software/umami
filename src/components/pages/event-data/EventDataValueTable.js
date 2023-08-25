import { GridTable, GridColumn, Button, Icon, Text } from 'react-basics';
import { useMessages, usePageQuery } from 'components/hooks';
import Link from 'next/link';
import Icons from 'components/icons';
import PageHeader from 'components/layout/PageHeader';
import Empty from 'components/common/Empty';
import { DATA_TYPES } from 'lib/constants';

export function EventDataValueTable({ data = [], event }) {
  const { formatMessage, labels } = useMessages();
  const { resolveUrl } = usePageQuery();

  const Title = () => {
    return (
      <>
        <Link href={resolveUrl({ event: undefined })}>
          <Button>
            <Icon rotate={180}>
              <Icons.ArrowRight />
            </Icon>
            <Text>{formatMessage(labels.back)}</Text>
          </Button>
        </Link>
        <Text>{event}</Text>
      </>
    );
  };

  return (
    <>
      <PageHeader title={<Title />} />
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
