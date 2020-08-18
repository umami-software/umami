import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import ChangePasswordForm from '../forms/ChangePasswordForm';
import Modal from 'components/common/Modal';
import Dots from 'assets/ellipsis-h.svg';

export default function ProfileSettings() {
  const user = useSelector(state => state.user);
  const [changePassword, setChangePassword] = useState(false);
  const { user_id } = user;

  return (
    <>
      <PageHeader>
        <div>Profile</div>
        <Button icon={<Dots />} size="small" onClick={() => setChangePassword(true)}>
          <div>Change password</div>
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
