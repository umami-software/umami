import { useQuery } from '@tanstack/react-query';
import UserDelete from 'components/pages/settings/users/UserDelete';
import UserEditForm from 'components/pages/settings/users/UserEditForm';
import UserPasswordForm from 'components/pages/settings/users/UserPasswordForm';
import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import useApi from 'hooks/useApi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Breadcrumbs, Item, Icon, Tabs, useToast, Modal, Button } from 'react-basics';
import Pen from 'assets/pen.svg';

export default function UserSettings({ userId }) {
  const [edit, setEdit] = useState(false);
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('general');
  const { get } = useApi();
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

  const handleAdd = () => {
    setEdit(true);
  };

  const handleClose = () => {
    setEdit(false);
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
        <Button onClick={handleAdd}>
          <Icon>
            <Pen />
          </Icon>
          Change Password
        </Button>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="general">General</Item>
        <Item key="delete">Danger Zone</Item>
      </Tabs>
      {tab === 'general' && <UserEditForm userId={userId} data={values} onSave={handleSave} />}
      {tab === 'delete' && <UserDelete userId={userId} onSave={handleDelete} />}
      {edit && (
        <Modal title="Add website" onClose={handleClose}>
          {close => (
            <UserPasswordForm userId={userId} data={values} onSave={handleSave} onClose={close} />
          )}
        </Modal>
      )}
    </Page>
  );
}
