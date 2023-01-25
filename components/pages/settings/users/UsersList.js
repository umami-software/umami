import { useIntl } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import UsersTable from './UsersTable';
import UserAddButton from './UserAddButton';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';
import { useToast } from 'react-basics';
import { labels, messages } from 'components/messages';

export default function UsersList() {
  const { formatMessage } = useIntl();
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(['user'], () => get(`/users`), {
    enabled: !!user,
  });
  const { toast, showToast } = useToast();
  const hasData = data && data.length !== 0;

  const handleSave = () => refetch();

  const handleDelete = () =>
    showToast({ message: formatMessage(messages.deleted), variant: 'success' });

  return (
    <Page loading={isLoading} error={error}>
      {toast}
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
