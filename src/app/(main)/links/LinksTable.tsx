import { DataTable, DataColumn, Row } from '@umami/react-zen';
import { useMessages, useNavigation } from '@/components/hooks';
import { Empty } from '@/components/common/Empty';
import { DateDistance } from '@/components/common/DateDistance';
import { LinkEditButton } from './LinkEditButton';
import { LinkDeleteButton } from './LinkDeleteButton';

export function LinksTable({ data = [] }) {
  const { formatMessage, labels } = useMessages();
  const { websiteId } = useNavigation();

  if (data.length === 0) {
    return <Empty />;
  }

  return (
    <DataTable data={data}>
      <DataColumn id="name" label={formatMessage(labels.name)} />
      <DataColumn id="url" label={formatMessage(labels.destinationUrl)} />
      <DataColumn id="created" label={formatMessage(labels.created)}>
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {(row: any) => {
          const { id, name } = row;

          return (
            <Row>
              <LinkEditButton linkId={id} />
              <LinkDeleteButton linkId={id} websiteId={websiteId} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
