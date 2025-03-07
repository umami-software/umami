import { Button, Icon, Text, Modal, Icons, ModalTrigger, useToasts } from 'react-basics';
import UserAddForm from './UserAddForm';
import { useMessages, useModified } from '@/components/hooks';

export function UserAddButton({ onSave }: { onSave?: () => void }) {
  const { formatMessage, labels, messages } = useMessages();
  const { showToast } = useToasts();
  const { touch } = useModified();

  const handleSave = () => {
    showToast({ message: formatMessage(messages.saved), variant: 'success' });
    touch('users');
    onSave?.();
  };

  return (
    <ModalTrigger>
      <Button data-test="button-create-user" variant="primary">
        <Icon>
          <Icons.Plus />
        </Icon>
        <Text>{formatMessage(labels.createUser)}</Text>
      </Button>
      <Modal title={formatMessage(labels.createUser)}>
        {(close: () => void) => <UserAddForm onSave={handleSave} onClose={close} />}
      </Modal>
    </ModalTrigger>
  );
}

export default UserAddButton;
