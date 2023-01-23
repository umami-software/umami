import { useIntl, defineMessages } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import UsersTable from './UsersTable';
import UserAddButton from './UserAddButton';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';

const messages = defineMessages({
  noUsers: {
    id: 'messages.no-users',
    defaultMessage: "You don't have any users.",
  },
  users: { id: 'label.users', defaultMessage: 'Users' },
  createUser: { id: 'label.create-user', defaultMessage: 'Create user' },
});

export default function UsersList() {
  const { formatMessage } = useIntl();
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error } = useQuery(['user'], () => get(`/users`), {
    enabled: !!user,
  });
  const hasData = data && data.length !== 0;

  const addButton = <UserAddButton />;

  return (
    <Page loading={isLoading} error={error}>
      <PageHeader title={formatMessage(messages.users)}>{addButton}</PageHeader>
      {hasData && <UsersTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noUsers)}>{addButton}</EmptyPlaceholder>
      )}
    </Page>
  );
}
