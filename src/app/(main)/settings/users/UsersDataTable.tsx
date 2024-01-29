'use client';
import { useApi } from 'components/hooks';
import { useFilterQuery } from 'components/hooks';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import useCache from 'store/cache';

export function UsersDataTable({ showActions }: { showActions: boolean }) {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.users);
  const queryResult = useFilterQuery({
    queryKey: ['users', { modified }],
    queryFn: (params: { [key: string]: any }) => get(`/admin/users`, params),
  });

  return (
    <DataTable queryResult={queryResult}>
      {({ data }) => <UsersTable data={data} showActions={showActions} />}
    </DataTable>
  );
}

export default UsersDataTable;
