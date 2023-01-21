import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Icon, Modal, useToast } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import { Lock } from 'components/icons';

const messages = defineMessages({
  changePassword: { id: 'label.change-password', defaultMessage: 'Change password' },
  saved: { id: 'message.saved-successfully', defaultMessage: 'Saved successfully.' },
});

export default function ChangePasswordButton() {
  const { formatMessage } = useIntl();
  const [edit, setEdit] = useState(false);
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setEdit(false);
  };

  const handleAdd = () => {
    setEdit(true);
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <>
      {toast}
      <Button onClick={handleAdd}>
        <Icon>
          <Lock />
        </Icon>
        Change Password
      </Button>
      {edit && (
        <Modal title={formatMessage(messages.changePassword)} onClose={handleClose}>
          {() => <PasswordEditForm onSave={handleSave} onClose={handleClose} />}
        </Modal>
      )}
    </>
  );
}
