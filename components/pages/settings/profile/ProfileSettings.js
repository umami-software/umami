import Page from 'components/layout/Page';
import PageHeader from 'components/layout/PageHeader';
import ProfileDetails from 'components/settings/ProfileDetails';
import { useState } from 'react';
import { Breadcrumbs, Icon, Item, useToast, Modal, Button } from 'react-basics';
import UserPasswordForm from 'components/pages/settings/users/UserPasswordForm';
import Lock from 'assets/lock.svg';

export default function ProfileSettings() {
  const [edit, setEdit] = useState(false);
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
            <Lock />
          </Icon>
          Change Password
        </Button>
      </PageHeader>
      <ProfileDetails />
      {edit && (
        <Modal title="Change password" onClose={handleClose}>
          {close => <UserPasswordForm onSave={handleSave} onClose={close} />}
        </Modal>
      )}
    </Page>
  );
}
