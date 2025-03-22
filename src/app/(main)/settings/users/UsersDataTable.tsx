import { DataGrid } from '@/components/common/DataGrid';
import { useUsersQuery } from '@/components/hooks';
import { UsersTable } from './UsersTable';
import { ReactNode } from 'react';

export function UsersDataTable({
  showActions,
  children,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useUsersQuery();

  return (
    <DataGrid queryResult={queryResult} renderEmpty={() => children}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
