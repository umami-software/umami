import { DataGrid } from '@/components/common/DataGrid';
import { useBoardsQuery, useNavigation } from '@/components/hooks';
import { BoardsTable } from './BoardsTable';

export function BoardsDataTable() {
  const { teamId } = useNavigation();
  const query = useBoardsQuery({ teamId });

  return (
    <DataGrid query={query} allowSearch={true} autoFocus={false} allowPaging={true}>
      {({ data }) => <BoardsTable data={data} />}
    </DataGrid>
  );
}
