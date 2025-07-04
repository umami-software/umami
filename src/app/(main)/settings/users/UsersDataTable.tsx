import { DataGrid } from '@/components/common/DataGrid';
import { useUsersQuery } from '@/components/hooks';
import { UsersTable } from './UsersTable';
import { ReactNode } from 'react';

export function UsersDataTable({ showActions }: { showActions?: boolean; children?: ReactNode }) {
  const queryResult = useUsersQuery();

  return (
    <DataGrid queryResult={queryResult} allowSearch={true}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
