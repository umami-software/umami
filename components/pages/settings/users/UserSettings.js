import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserDelete from 'components/pages/settings/users/UserDelete';
import UserEditForm from 'components/pages/settings/users//UserEditForm';
import UserPasswordForm from 'components/pages/settings/users/UserPasswordForm';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import useApi from 'hooks/useApi';

const messages = defineMessages({
  users: { id: 'label.users', defaultMessage: 'Users' },
  details: { id: 'label.details', defaultMessage: 'Details' },
  changePassword: { id: 'label.change-password', defaultMessage: 'Change password' },
  actions: { id: 'label.actions', defaultMessage: 'Actions' },
  saved: { id: 'message.saved-successfully', defaultMessage: 'Saved successfully.' },
  delete: { id: 'message.delete-successfully', defaultMessage: 'Delete successfully.' },
});

export default function UserSettings({ userId }) {
  const { formatMessage } = useIntl();
  const [edit, setEdit] = useState(false);
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('details');
  const { get, useQuery } = useApi();
  const { toast, showToast } = useToast();
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ['user', userId],
    () => {
      if (userId) {
        return get(`/users/${userId}`);
      }
    },
    { cacheTime: 0 },
  );

  const handleSave = data => {
    showToast({ message: 'Saved successfully.', variant: 'success' });
    if (data) {
      setValues(state => ({ ...state, ...data }));
    }

    if (edit) {
      setEdit(false);
    }
  };

  const handleDelete = async () => {
    showToast({ message: 'Deleted successfully.', variant: 'danger' });
    await router.push('/users');
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  return (
    <Page loading={isLoading || !values}>
      {toast}
      <PageHeader>
        <Breadcrumbs>
          <Item>
            <Link href="/settings/users">{formatMessage(messages.users)}</Link>
          </Item>
          <Item>{values?.username}</Item>
        </Breadcrumbs>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="details">{formatMessage(messages.details)}</Item>
        <Item key="password">{formatMessage(messages.changePassword)}</Item>
        <Item key="delete">{formatMessage(messages.actions)}</Item>
      </Tabs>
      {tab === 'details' && <UserEditForm userId={userId} data={values} onSave={handleSave} />}
      {tab === 'password' && <UserPasswordForm userId={userId} onSave={handleSave} />}
      {tab === 'delete' && <UserDelete userId={userId} onSave={handleDelete} />}
    </Page>
  );
}
