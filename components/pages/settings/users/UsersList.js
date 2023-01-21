import { useState } from 'react';
import { Button, Text, Icon, useToast, Icons, Modal } from 'react-basics';
import { useIntl, defineMessages } from 'react-intl';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import EmptyPlaceholder from 'components/common/EmptyPlaceholder';
import UsersTable from 'components/pages/settings/users/UsersTable';
import UserEditForm from 'components/pages/settings/users/UserEditForm';
import useApi from 'hooks/useApi';
import useUser from 'hooks/useUser';

const { Plus } = Icons;

const messages = defineMessages({
  saved: { id: 'messages.api-key-saved', defaultMessage: 'API key saved.' },
  noUsers: {
    id: 'messages.no-useres',
    defaultMessage: "You don't have any users.",
  },
  users: { id: 'label.users', defaultMessage: 'Users' },
  createUser: { id: 'label.create-user', defaultMessage: 'Create user' },
});

export default function UsersList() {
  const [edit, setEdit] = useState(false);
  const { formatMessage } = useIntl();
  const { toast, showToast } = useToast();
  const { user } = useUser();
  const { get, useQuery } = useApi();
  const { data, isLoading, error, refetch } = useQuery(['user'], () => get(`/users`), {
    enabled: !!user,
  });
  const hasData = data && data.length !== 0;

  const handleSave = async () => {
    await refetch();
    setEdit(false);
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
  };

  const handleAdd = () => setEdit(true);

  const handleClose = () => setEdit(false);

  const addButton = (
    <Button variant="primary" onClick={handleAdd}>
      <Icon>
        <Plus />
      </Icon>
      <Text>{formatMessage(messages.createUser)}</Text>
    </Button>
  );

  return (
    <Page loading={isLoading} error={error}>
      {toast}
      <PageHeader title={formatMessage(messages.users)}>{addButton}</PageHeader>
      {hasData && <UsersTable data={data} />}
      {!hasData && (
        <EmptyPlaceholder message={formatMessage(messages.noUsers)}>{addButton}</EmptyPlaceholder>
      )}
      {edit && (
        <Modal title={formatMessage(messages.createUser)} onClose={handleClose}>
          {close => <UserEditForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
