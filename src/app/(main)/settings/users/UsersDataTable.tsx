import DataTable from 'components/common/DataTable';
import { useUsers } from 'components/hooks';
import UsersTable from './UsersTable';

export function UsersDataTable({ showActions }: { showActions?: boolean }) {
  const queryResult = useUsers();

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataTable>
  );
}

export default UsersDataTable;
