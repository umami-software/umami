import { useToasts } from 'react-basics';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import UsersTable from './UsersTable';
import UserAddButton from './UserAddButton';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import useMessages from 'hooks/useMessages';

export function UsersList() {
  const { formatMessage, labels, messages } = useMessages();
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(['user'], () => get(`/users`), {
    enabled: !!user,
  });
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
      {hasData && <UsersTable data={data} onDelete={handleDelete} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noUsers)}>
          <UserAddButton onSave={handleSave} />
        </EmptyPlaceholder>
      )}
    </Page>
  );
}

export default UsersList;
