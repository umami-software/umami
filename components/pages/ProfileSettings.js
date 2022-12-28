import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from 'components/settings/ProfileDetails';
import { useState } from 'react';
import { Breadcrumbs, Item, Tabs, useToast, Modal, Button } from 'react-basics';
import UserPasswordForm from 'components/forms/UserPasswordForm';
import Icon from './../common/Icon';
import Pen from 'assets/pen.svg';

export default function ProfileSettings() {
  const [edit, setEdit] = useState(false);
  const [tab, setTab] = useState('general');
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: 'Saved successfully.', variant: 'success' });
    setEdit(false);
  };

  const handleAdd = () => {
    setEdit(true);
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <Page>
      {toast}
      <PageHeader>
        <Breadcrumbs>
          <Item>Profile</Item>
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
      </Tabs>
      {tab === 'general' && <ProfileDetails />}
      {edit && (
        <Modal title="Add website" onClose={handleClose}>
          {close => <UserPasswordForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
