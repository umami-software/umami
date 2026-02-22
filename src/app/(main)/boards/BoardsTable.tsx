import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import Board from 'next/link';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages, useNavigation, useSlug } from '@/components/hooks';

export function BoardsTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const { websiteId, renderUrl } = useNavigation();
  const { getSlugUrl } = useSlug('link');

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={t(labels.name)}>
        {({ id, name }: any) => {
          return <Board href={renderUrl(`/boards/${id}`)}>{name}</Board>;
        }}
      </DataColumn>
      <DataColumn id="description" label={t(labels.description)} />
      <DataColumn id="created" label={t(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ id, name }: any) => {
          return <Row></Row>;
        }}
      </DataColumn>
    </DataTable>
  );
}
