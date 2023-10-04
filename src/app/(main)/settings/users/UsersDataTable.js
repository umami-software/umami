'use client';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import UsersHeader from './UsersHeader';

export function UsersDataTable() {
  const { get } = useApi();
  const queryResult = useFilterQuery(['users'], params => {
    return get(`/users`, {
      ...params,
    });
  });

  return (
    <>
      <UsersHeader />
      <DataTable queryResult={queryResult}>{({ data }) => <UsersTable data={data} />}</DataTable>
    </>
  );
}

export default UsersDataTable;
