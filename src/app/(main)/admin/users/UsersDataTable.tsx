import type { ReactNode } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import { useUsersQuery } from '@/components/hooks';
import { UsersTable } from './UsersTable';

export function UsersDataTable({ showActions }: { showActions?: boolean; children?: ReactNode }) {
  const queryResult = useUsersQuery();

  return (
    <DataGrid query={queryResult} allowSearch={true}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataGrid>
  );
}
