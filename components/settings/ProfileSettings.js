import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import PageHeader from 'components/layout/PageHeader';
import Button from 'components/common/Button';
import Modal from 'components/common/Modal';
import Toast from 'components/common/Toast';
import ChangePasswordForm from 'components/forms/ChangePasswordForm';
import Dots from 'assets/ellipsis-h.svg';

export default function ProfileSettings() {
  const user = useSelector(state => state.user);
  const [changePassword, setChangePassword] = useState(false);
  const [message, setMessage] = useState();
  const { user_id } = user;

  function handleSave() {
    setChangePassword(false);
    setMessage(<FormattedMessage id="message.save-success" defaultMessage="Saved successfully." />);
  }

  return (
    <>
      <PageHeader>
        <div>
          <FormattedMessage id="settings.profile" defaultMessage="Profile" />
        </div>
        <Button icon={<Dots />} size="small" onClick={() => setChangePassword(true)}>
          <div>
            <FormattedMessage id="button.change-password" defaultMessage="Change password" />
          </div>
        </Button>
      </PageHeader>
      <dl>
        <dt>
          <FormattedMessage id="label.username" defaultMessage="Username" />
        </dt>
        <dd>{user.username}</dd>
      </dl>
      {changePassword && (
        <Modal title="Change password">
          <ChangePasswordForm
            values={{ user_id }}
            onSave={handleSave}
            onClose={() => setChangePassword(false)}
          />
        </Modal>
      )}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </>
  );
}
