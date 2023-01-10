import { Button, Modal, useToast, Icon, Tabs, Item } from 'react-basics';
import { useEffect, useState } from 'react';
import useApi from 'hooks/useApi';
import PasswordEditForm from 'components/pages/settings/account/PasswordEditForm';
import PageHeader from 'components/layout/PageHeader';
import AccountEditForm from 'components/pages/settings/account/AccountEditForm';
import Lock from 'assets/lock.svg';
import Page from 'components/layout/Page';
import ApiKeysList from 'components/pages/settings/account/ApiKeysList';
import useUser from 'hooks/useUser';

export default function AccountDetails() {
  const { user } = useUser();
  const [values, setValues] = useState(null);
  const [tab, setTab] = useState('detail');
  const [showForm, setShowForm] = useState(false);
  const { get, useQuery } = useApi();
  const { data, isLoading } = useQuery(['account'], () => get(`/accounts/${user.id}`), {
    cacheTime: 0,
  });
  const { toast, showToast } = useToast();

  const handleChangePassword = () => setShowForm(true);

  const handleClose = () => {
    setShowForm(false);
  };

  const handleSave = data => {
    setValues(data);
    showToast({ message: 'Saved successfully.', variant: 'success' });
  };

  const handlePasswordSave = () => {
    setShowForm(false);
    showToast({ message: 'Password successfully changed', variant: 'success' });
  };

  useEffect(() => {
    if (data) {
      setValues(data);
    }
  }, [data]);

  return (
    <Page loading={isLoading || !values}>
      {toast}
      <PageHeader title="Account">
        <Button onClick={handleChangePassword}>
          <Icon>
            <Lock />
          </Icon>
          Change password
        </Button>
      </PageHeader>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 30, fontSize: 14 }}>
        <Item key="detail">Details</Item>
        <Item key="apiKey">API Keys</Item>
      </Tabs>
      {tab === 'detail' && <AccountEditForm data={values} onSave={handleSave} />}
      {tab === 'apiKey' && <ApiKeysList />}
      {data && showForm && (
        <Modal title="Change password" onClose={handleClose} style={{ fontWeight: 'bold' }}>
          {close => <PasswordEditForm onSave={handlePasswordSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
