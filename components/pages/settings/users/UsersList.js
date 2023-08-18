import { useToasts } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import UsersTable from './UsersTable';
import UserAddButton from './UserAddButton';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';
import useApiFilter from 'hooks/useApiFilter';

export function UsersList() {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { filter, page, pageSize, handleFilterChange, handlePageChange, handlePageSizeChange } =
    useApiFilter();

  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(
    ['user', filter, page, pageSize],
    () =>
      get(`/users`, {
        filter,
        page,
        pageSize,
      }),
    {
      enabled: !!user,
    },
  );
  const { showToast } = useToasts();
  const hasData = data && data.length !== 0;

  const handleSave = () => {
    refetch().then(() => showToast({ message: formatMessage(messages.saved), variant: 'success' }));
  };

  const handleDelete = () => {
    refetch().then(() =>
      showToast({ message: formatMessage(messages.userDeleted), variant: 'success' }),
    );
  };

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(labels.users)}>
        <UserAddButton onSave={handleSave} />
      </PageHeader>
      {(hasData || filter) && (
        <UsersTable
          data={data}
          onDelete={handleDelete}
          onFilterChange={handleFilterChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          filterValue={filter}
        />
      )}
      {!hasData && !filter && (
        <EmptyPlaceholder message={formatMessage(messages.noUsers)}>
          <UserAddButton onSave={handleSave} />
        </EmptyPlaceholder>
      )}
    </Page>
  );
}

export default UsersList;
