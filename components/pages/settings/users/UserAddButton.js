import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button, Icon, Text, Modal, useToast, Icons } from 'react-basics';
import UserAddForm from './UserAddForm';

const { Plus } = Icons;

const messages = defineMessages({
  createUser: { id: 'label.create-user', defaultMessage: 'Create user' },
  saved: { id: 'message.saved-successfully', defaultMessage: 'Saved successfully.' },
});

export default function UserAddButton() {
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
      <Button variant="primary" onClick={handleAdd}>
        <Icon>
          <Plus />
        </Icon>
        <Text>{formatMessage(messages.createUser)}</Text>
      </Button>
      {edit && (
        <Modal title={formatMessage(messages.createUser)} onClose={handleClose}>
          {() => <UserAddForm onSave={handleSave} onClose={handleClose} />}
        </Modal>
      )}
    </>
  );
}
