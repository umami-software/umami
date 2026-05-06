import { DataColumn, DataTable, type DataTableProps, Row } from '@umami/react-zen';
import Link from '@/components/common/Link';
import { DateDistance } from '@/components/common/DateDistance';
import { useMessages, useNavigation } from '@/components/hooks';
import { BoardDeleteButton } from './BoardDeleteButton';
import { BoardDesignButton } from './BoardDesignButton';
import { BoardEditButton } from './BoardEditButton';

export function BoardsTable(props: DataTableProps) {
  const { t, labels } = useMessages();
  const { renderUrl } = useNavigation();

  return (
    <DataTable {...props}>
      <DataColumn id="name" label={t(labels.name)}>
        {({ id, name }: any) => {
          return <Link href={renderUrl(`/boards/${id}`)}>{name}</Link>;
        }}
      </DataColumn>
      <DataColumn id="description" label={t(labels.description)} />
      <DataColumn id="type" label={t(labels.boardType)}>
        {({ type }: any) => type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}
      </DataColumn>
      <DataColumn id="created" label={t(labels.created)} width="200px">
        {(row: any) => <DateDistance date={new Date(row.createdAt)} />}
      </DataColumn>
      <DataColumn id="action" align="end" width="100px">
        {({ id, name }: any) => {
          return (
            <Row>
              <BoardDesignButton boardId={id} />
              <BoardEditButton boardId={id} />
              <BoardDeleteButton boardId={id} name={name} />
            </Row>
          );
        }}
      </DataColumn>
    </DataTable>
  );
}
