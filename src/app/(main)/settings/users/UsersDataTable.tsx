'use client';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import useUsers from 'components/hooks/queries/useUsers';

export function UsersDataTable({ showActions }: { showActions?: boolean }) {
  const queryResult = useUsers();

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataTable>
  );
}

export default UsersDataTable;
