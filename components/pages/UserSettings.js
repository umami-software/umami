import { useQuery } from '@tanstack/react-query';
import UserDelete from 'components/pages/UserDelete';
import UserEditForm from 'components/forms/UserEditForm';
import UserPasswordForm from 'components/forms/UserPasswordForm';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import { getAuthToken } from 'lib/client';
import { useApi } from 'next-basics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast } from 'react-basics';

export default function UserSettings({ userId }) {
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('general');
  const { get } = useApi(getAuthToken());
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
            <Link href="/users">Users</Link>
          </Item>
          <Item>{values?.username}</Item>
        </Breadcrumbs>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="general">General</Item>
        <Item key="password">Password</Item>
        <Item key="delete">Danger Zone</Item>
      </Tabs>
      {tab === 'general' && <UserEditForm userId={userId} data={values} onSave={handleSave} />}
      {tab === 'password' && <UserPasswordForm userId={userId} data={values} onSave={handleSave} />}
      {tab === 'delete' && <UserDelete userId={userId} onSave={handleDelete} />}
    </Page>
  );
}
