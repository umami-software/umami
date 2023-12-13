'use client';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import UsersHeader from './UsersHeader';
import useCache from 'store/cache';

export function UsersDataTable() {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.users);
  const queryResult = useFilterQuery({
    queryKey: ['users', { modified }],
    queryFn: (params: { [key: string]: any }) => get(`/admin/users`, params),
  });

  return (
    <>
      <UsersHeader />
      <DataTable queryResult={queryResult}>{({ data }) => <UsersTable data={data} />}</DataTable>
    </>
  );
}

export default UsersDataTable;
