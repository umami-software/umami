import { DataGrid } from '@/components/common/DataGrid';
import { useUsers } from '@/components/hooks';
import { UsersTable } from './UsersTable';
import { ReactNode } from 'react';

export function UsersDataTable({
  showActions,
  children,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useUsers();

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
