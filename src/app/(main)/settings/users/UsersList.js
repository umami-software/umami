'use client';
import useApi from 'components/hooks/useApi';
import useFilterQuery from 'components/hooks/useFilterQuery';
import DataTable from 'components/common/DataTable';
import UsersTable from './UsersTable';
import UsersHeader from './UsersHeader';

export function UsersList() {
  const { get } = useApi();
  const filterQuery = useFilterQuery(['users'], params => {
    return get(`/users`, {
      ...params,
    });
  });
  const { getProps } = filterQuery;

  return (
    <>
      <UsersHeader />
      <DataTable {...getProps()}>{({ data }) => <UsersTable data={data} />}</DataTable>
    </>
  );
}

export default UsersList;
