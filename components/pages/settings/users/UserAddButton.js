import { useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, Icon, Text, Modal, useToast, Icons } from 'react-basics';
import UserAddForm from './UserAddForm';
import { labels, messages } from 'components/messages';

const { Plus } = Icons;

export default function UserAddButton({ onSave }) {
  const { formatMessage } = useIntl();
  const [edit, setEdit] = useState(false);
  const { toast, showToast } = useToast();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    setEdit(false);
    onSave();
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
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      {edit && (
        <Modal title={formatMessage(labels.createUser)} onClose={handleClose}>
          <UserAddForm onSave={handleSave} onClose={handleClose} />
        </Modal>
      )}
    </>
  );
}
