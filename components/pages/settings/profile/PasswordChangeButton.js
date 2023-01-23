import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Icon, Text, Modal, useToast } from 'react-basics';
import PasswordEditForm from 'components/pages/settings/profile/PasswordEditForm';
import { Lock } from 'components/icons';

const messages = defineMessages({
  changePassword: { id: 'label.change-password', defaultMessage: 'Change password' },
  saved: { id: 'message.saved-successfully', defaultMessage: 'Saved successfully.' },
});

export default function PasswordChangeButton() {
  const { formatMessage } = useIntl();
  const [edit, setEdit] = useState(false);
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setEdit(false);
  };

  const handleEdit = () => {
    setEdit(true);
  };

  const handleClose = () => {
    setEdit(false);
  };

  return (
    <>
      {toast}
      <Button onClick={handleEdit}>
        <Icon>
          <Lock />
        </Icon>
        <Text>{formatMessage(messages.changePassword)}</Text>
      </Button>
      {edit && (
        <Modal title={formatMessage(messages.changePassword)} onClose={handleClose}>
          {() => <PasswordEditForm onSave={handleSave} onClose={handleClose} />}
        </Modal>
      )}
    </>
  );
}
