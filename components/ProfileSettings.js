import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from './layout/PageHeader';
import Button from './common/Button';
import ChangePasswordForm from './forms/ChangePasswordForm';
import Modal from './common/Modal';

export default function ProfileSettings() {
  const user = useSelector(state => state.user);
  const [changePassword, setChangePassword] = useState(false);
  const { user_id } = user;

  return (
    <>
      <PageHeader>
        <div>Profile</div>
        <Button size="small" onClick={() => setChangePassword(true)}>
          Change password
        </Button>
      </PageHeader>
      <dl>
        <dt>Username</dt>
        <dd>{user.username}</dd>
      </dl>
      {changePassword && (
        <Modal title="Change password">
          <ChangePasswordForm
            values={{ user_id }}
            onSave={() => setChangePassword(false)}
            onClose={() => setChangePassword(false)}
          />
        </Modal>
      )}
    </>
  );
}
