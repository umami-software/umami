import DataTable from 'components/common/DataTable';
import { useUsers } from 'components/hooks';
import UsersTable from './UsersTable';
import { ReactNode } from 'react';

export function UsersDataTable({
  showActions,
  children,
}: {
  showActions?: boolean;
  children?: ReactNode;
}) {
  const queryResult = useUsers();

  if (queryResult?.result?.data?.length === 0) {
    return children;
  }

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataTable>
  );
}

export default UsersDataTable;
